export default {
  nodes: (state: any, getters: any, rootState: any, rootGetters: any) => (resource: string) => {
    const nodes = rootGetters['cluster/all'](resource)
    console.log("🚀🚀🚀🚀🚀 ~ nodes:", nodes)
    return []
  },
}