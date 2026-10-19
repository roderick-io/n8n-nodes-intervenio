import {
	NodeConnectionTypes,
	type INodeType,
	type INodeTypeDescription,
} from 'n8n-workflow';

export class Intervenio implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'interven.io',
		name: 'intervenio',
		icon: 'file:intervenio.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Redact and restore sensitive text through interven.io',
		defaults: {
			name: 'interven.io',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'intervenioOAuth2Api',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://api.interven.io',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Redact Text',
						value: 'redact',
						action: 'Redact sensitive information in text',
						routing: {
							request: {
								method: 'POST',
								url: '/redact',
							},
						},
					},
					{
						name: 'Restore Text',
						value: 'restore',
						action: 'Restore sensitive information in text',
						routing: {
							request: {
								method: 'POST',
								url: '/restore',
							},
						},
					},
				],
				default: 'redact',
			},
			{
				displayName: 'Text',
				name: 'text',
				type: 'string',
				typeOptions: {
					rows: 6,
				},
				default: '',
				required: true,
				description: 'Text to redact, or redacted text to restore',
				routing: {
					send: {
						type: 'body',
						property: 'text',
					},
				},
			},
			{
				displayName: 'Log ID',
				name: 'logId',
				type: 'string',
				default: '',
				required: true,
				description: 'The Log ID returned by Redact Text',
				displayOptions: {
					show: {
						operation: ['restore'],
					},
				},
				routing: {
					send: {
						type: 'body',
						property: 'log_id',
					},
				},
			},
		],
	};
}
