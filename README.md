# n8n-nodes-intervenio

An n8n community node for interven.io. Redact personally identifiable information before sending text to an LLM, then restore original values afterward.

## How it works

    Input text
      → interven.io: Redact Text
      → LLM
      → interven.io: Restore Text
      → Restored text

1. **Redact Text** sends the input text to interven.io.
2. interven.io returns `redacted_text` and a `log_id`.
3. An LLM processes `redacted_text`.
4. **Restore Text** sends the LLM output and the matching `log_id` to interven.io.
5. interven.io returns `restored_text`.

n8n only passes the `log_id` between Redact and Restore. The original-value mapping remains within interven.io.

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

The interven.io credential uses OAuth 2.0 Client Credentials authentication.

| Setting | Value |
|---|---|
| Required fields | Client ID and Client Secret |
| OAuth grant type | Client Credentials |
| API base URL | `https://api.interven.io` |
| Token URL | `https://app.interven.io/o/token/` |

### Create Client Credentials

Obtain your Client Credentials from the interven.io portal at https://app.interven.io as follows:
1. Log in using your interven.io credentials.
2. On the left-hand side, click on "Connections".
3. Click on "Add connection".
4. In the pop-up, select "OAuth Client Credentials".
5. Give the credentials an appropriate name. For instance: "n8n credentials".
6. Store the provided client_id and client_secret securely.

In n8n:

1. Create an **interven.io OAuth2 API** credential.
2. Enter the Client ID and Client Secret from the interven.io portal.
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
      → interven.io — Redact
      → LLM
      → interven.io — Restore

### 1. Manual Trigger

Add a **Manual Trigger** node.

### 2. Edit Fields

Add an **Edit Fields** node and create a field named `text`.

Example value:

    Draft a concise reply to Jane Doe at jane@example.com about her account.

### 3. interven.io — Redact

Add an **interven.io** node.

| Field | Value |
|---|---|
| Operation | Redact Text |
| Text | `{{ $json.text }}` |
| Credential | Your interven.io OAuth2 API credential |

Rename this node:

    interven.io — Redact

The output includes `redacted_text` and `log_id`.

### 4. LLM

Add your preferred LLM node after **interven.io — Redact**.

Use this as the prompt:

    {{ $json.redacted_text }}

Instruct the LLM to retain placeholders such as `<PERSON_1>` and `<EMAIL_1>` exactly. Do not allow it to remove, rename, translate, or reformat them.

### 5. interven.io — Restore

Add a second **interven.io** node after the LLM node.

Rename it:

    interven.io — Restore

| Field | Value |
|---|---|
| Operation | Restore Text |
| Text | The LLM response text |
| Log ID | `{{ $('interven.io — Redact').item.json.log_id }}` |
| Credential | Your interven.io OAuth2 API credential |

For an LLM node whose output text is in the `text` field, set **Text** to:

    {{ $json.text }}

The result contains `restored_text`.

## Important Workflow Guidance

- Use the `log_id` from the corresponding Redact operation.
- Do not mix `log_id` values between messages or executions.
- Preserve interven.io placeholders through all LLM prompts and transformations.
- Rename the two interven.io nodes as shown if using the supplied Log ID expression.

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

- [interven.io](https://interven.io)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)

## Version History

### 0.1.0

- Initial release.
- Added **Redact Text** and **Restore Text** operations.
- Added OAuth 2.0 Client Credentials authentication.
