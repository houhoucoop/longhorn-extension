import { COUNT, MANAGEMENT, NAMESPACE, UI, SCHEMA } from "@shell/config/types";
import { handleSpoofedRequest } from "@shell/plugins/dashboard-store/actions";
import { PRODUCT_NAME } from "../types/longhorn";
import { ClusterNotFoundError } from "@shell/utils/error";
import { SETTING } from "@shell/config/settings";
import { allHash } from "@shell/utils/promise";
import {
  NAMESPACE_FILTER_ALL_USER as ALL_USER,
} from '@shell/utils/namespace-filter';
import { NAMESPACE_FILTERS } from '@shell/store/prefs';
import { addSchemaIndexFields } from '@shell/plugins/steve/schema.utils';
import { parse as parseUrl, stringify as unParseUrl } from '@shell/utils/url';
import { createNamespaceFilterKeyWithId } from '@shell/utils/namespace-filter';
import { longhornfy } from '../utils/store'

export default {
  async loadCluster({ state, commit, dispatch, getters, rootGetters, rootState }: any, { id }: any) {
    console.log("🚀🚀🚀🚀🚀 ~ loadCluster ~ loadCluster:")
    // see if cluster is ready
    try {
      const cluster = await dispatch("management/find",
        {type: MANAGEMENT.CLUSTER, id, opt: { url: `${MANAGEMENT.CLUSTER}s/${id}` }},
        { root: true }
      );

      if (!cluster.isReady) {
        console.warn("Cluster is not ready, cannot load it:", cluster.nameDisplay); // eslint-disable-line no-console
        throw new Error("Unready cluster");
      }
    } catch {
      commit("clusterId", null, { root: true });
      commit("applyConfig", { baseUrl: null });
      throw new ClusterNotFoundError(id);
    }

    commit("applyConfig", { baseUrl: `/k8s/clusters/${id}/v1` }); // update the Steve client URLs for resources

    await dispatch('loadSchemas') // custom load schema

    console.log("Done loading cluster."); // eslint-disable-line no-console
  },

  async loadSchemas(ctx: any) {
    const { getters, commit, rootGetters,  dispatch } = ctx;

    const res = await dispatch('findAll', { type: SCHEMA, opt: { url: '/schemas', load: false, }}); // fetch cluster schema
    const customSchema = [{
      product:           PRODUCT_NAME,
      id:                'longhorn-node',
      type:              'schema',
      collectionMethods: ['get'],
      resourceFields:    { },
      attributes:        { namespaced: true }
    }]
    const spoofedSchemas = rootGetters['type-map/spoofedSchemas'](PRODUCT_NAME);

    res.data = [...res.data, ...customSchema, ...spoofedSchemas];
    res.data.forEach(addSchemaIndexFields);

    commit('loadAll', {
      ctx,
      type: SCHEMA,
      data: res.data,
    });

    const all = getters.all(SCHEMA);

    return all;
  },

  async request(context: any, { opt, type, clusterId, growlOnError = false }: any) {
    const { rootGetters, dispatch, getters, state, commit } = context;

    opt.url = opt.url.replace(/\/*$/g, '');
    const baseUrl = opt?.prependPath || state.config?.baseUrl || '';

    let ps = Promise.resolve(baseUrl);

    return await ps
      .then(async(prependPath = opt?.prependPath) => {
        if (opt.url.startsWith('/')) {
          opt.url = prependPath + opt.url;
        } else {
          const url = parseUrl(opt.url);

          if (!url.path.startsWith(prependPath)) {
            url.path = prependPath + url.path;
            opt.url = unParseUrl(url);
          }
        }

        return (this as any).$axios(opt);
      })
      .then((res) => {
        if ( opt.responseType ) {
          return res;
        } else {
          const out = res.data || {};
          const schema = getters["schemaFor"](type);

          if (Array.isArray(out)) {
            res.data = { data: out.map((o) => longhornfy(o, schema, type)) };
          } else {
            res.data = longhornfy(out, schema, type);
          }

          if (opt?.shouldMapResources) {
            commit('mapResources', responseObject(res))
            return getters[type]
          }

          return responseObject(res)
        }
      }).catch((err) => {
        return Promise.reject(err);
      });

      function responseObject(res: any) {
        let out = res.data;

        if (typeof out === 'string') {
          out = {};
        }

        if ( res.status === 204 || out === null || typeof out === 'string') {
          out = {};
        }

        Object.defineProperties(out, {
          _status:     { value: res.status },
          _statusText: { value: res.statusText },
          _headers:    { value: res.headers },
          _req:        { value: res.request },
          _url:        { value: opt.url },
        });

        return out;
      }
  },
};
