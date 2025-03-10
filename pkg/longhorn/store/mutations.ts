export default {
	mapResources(state, val) {
		state.nodes = val.data.map((node) => {
			return {
				id: node.id,
				kind: val.type,
				links: node.links,
				type: node.type,
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
					zone: node.zone
				}
			}
		})
	}
}