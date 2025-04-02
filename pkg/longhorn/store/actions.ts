export default {
	formatNodes: (ctx: any, res: any) => {
		const data = res?.data.map((node: any) => {
			return ({
				id: node.id,
				kind: 'Node',
				links: node.links,
				type: node.type,
				metadata: {
					name: node.name,
				},
				spec: {
					allowScheduling: node.allowScheduling,
					name: node.name
				},
				status: {
					autoEvicting: node.autoEvicting,
					conditions: node.conditions,
					disks: node.disks,
					evictionRequested: node.evictionRequested,
					instanceManagerCPURequest: node.instanceManagerCPURequest,
					region: node.region,
					tags: node.tags,
					zone: node.zone,
					address: node.address
				}
			})
		})

		return {
			data,
		}
	}
};
