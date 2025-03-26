import SteveModel from '@shell/plugins/steve/steve-class';

export default class NodesModel extends SteveModel {
  get availableActions() {
    console.log("🚀🚀🚀🚀🚀 ~ LonghornNodes ~ getavailableActions ~ availableActions:")
    return []
  }
}