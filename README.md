# n8n-nodes-intervenio

An n8n community node for Intervenio. Redact personally identifiable information before sending text to an LLM, then restore original values afterward.

## How it works

    Input text
      → Intervenio: Redact Text
      → LLM
      → Intervenio: Restore Text
      → Restored text

1. **Redact Text** sends the input text to Intervenio.
2. Intervenio returns `redacted_text` and a `log_id`.
3. An LLM processes `redacted_text`.
4. **Restore Text** sends the LLM output and the matching `log_id` to Intervenio.
5. Intervenio returns `restored_text`.

n8n only passes the `log_id` between Redact and Restore. The original-value mapping remains within Intervenio.

## Installation

### Community Nodes

1. In n8n, open **Settings** → **Community nodes**.
2. Select **Install**.
3. Enter `n8n-nodes-intervenio`.
4. Confirm installation.
5. Restart n8n if prompted.

### Manual installation

    cd ~/.n8n/nodes
    npm install n8n-nodes-intervenio

Restart n8n after installing.

## Credentials

The Intervenio credential uses OAuth 2.0 Client Credentials authentication.

| Setting | Value |
|---|---|
| Required fields | Client ID and Client Secret |
| OAuth grant type | Client Credentials |
| API base URL | `https://api.interven.io` |
| Token URL | `https://app.interven.io/o/token/` |

### Create Client Credentials

> TODO: Add instructions for creating an OAuth client in the Intervenio portal, assigning permissions, and copying the Client ID and Client Secret.

In n8n:

1. Create an **Intervenio OAuth2 API** credential.
2. Enter the Client ID and Client Secret from the Intervenio portal.
3. Save the credential.

## Operations

| Operation | Input | Output |
|---|---|---|
| Redact Text | `text` | `redacted_text`, `log_id` |
| Restore Text | `text`, `log_id` | `restored_text` |

### Redact Text

Sends:

    POST https://api.interven.io/redact

Example request:

    {
      "text": "Contact Jane Doe at jane@example.com."
    }

Example response:

    {
      "redacted_text": "Contact <PERSON_1> at <EMAIL_1>.",
      "log_id": "your-log-id"
    }

### Restore Text

Sends:

    POST https://api.interven.io/restore

Example request:

    {
      "log_id": "your-log-id",
      "text": "Hello <PERSON_1>. We will reply at <EMAIL_1>."
    }

Example response:

    {
      "restored_text": "Hello Jane Doe. We will reply at jane@example.com."
    }

## Example Workflow

    Manual Trigger
      → Edit Fields
      → Intervenio — Redact
      → LLM
      → Intervenio — Restore

### 1. Manual Trigger

Add a **Manual Trigger** node.

### 2. Edit Fields

Add an **Edit Fields** node and create a field named `text`.

Example value:

    Draft a concise reply to Jane Doe at jane@example.com about her account.

### 3. Intervenio — Redact

Add an **Intervenio** node.

| Field | Value |
|---|---|
| Operation | Redact Text |
| Text | `{{ $json.text }}` |
| Credential | Your Intervenio OAuth2 API credential |

Rename this node:

    Intervenio — Redact

The output includes `redacted_text` and `log_id`.

### 4. LLM

Add your preferred LLM node after **Intervenio — Redact**.

Use this as the prompt:

    {{ $json.redacted_text }}

Instruct the LLM to retain placeholders such as `<PERSON_1>` and `<EMAIL_1>` exactly. Do not allow it to remove, rename, translate, or reformat them.

### 5. Intervenio — Restore

Add a second **Intervenio** node after the LLM node.

Rename it:

    Intervenio — Restore

| Field | Value |
|---|---|
| Operation | Restore Text |
| Text | The LLM response text |
| Log ID | `{{ $('Intervenio — Redact').item.json.log_id }}` |
| Credential | Your Intervenio OAuth2 API credential |

For an LLM node whose output text is in the `text` field, set **Text** to:

    {{ $json.text }}

The result contains `restored_text`.

## Important Workflow Guidance

- Use the `log_id` from the corresponding Redact operation.
- Do not mix `log_id` values between messages or executions.
- Preserve Intervenio placeholders through all LLM prompts and transformations.
- Rename the two Intervenio nodes as shown if using the supplied Log ID expression.

## Development

### Prerequisites

- Node.js
- npm
- A local n8n installation

### Install dependencies

    npm install

### Build

    npm run build

### Lint

    npm run lint

### Local testing

    cd ~/.n8n/nodes
    npm install /path/to/n8n-nodes-intervenio

Restart n8n after installing or rebuilding the package.

## License

[MIT](LICENSE)

## Compatibility

Tested with n8n version: `2.43.8`.

Requires an n8n version that supports declarative community nodes and OAuth 2.0 Client Credentials credentials.

## Resources

- [Intervenio](https://interven.io)
- [Intervenio API documentation](https://interven.io/docs)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)

## Version History

### 0.1.0

- Initial release.
- Added **Redact Text** and **Restore Text** operations.
- Added OAuth 2.0 Client Credentials authentication.
