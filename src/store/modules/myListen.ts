import { VuexModule, Module, Action, Mutation, getModule } from 'vuex-module-decorators';
import store from '@/store';
import config from 'config.ts'

export interface MyListenKey {}

/**
 * @title Module装饰器
 * @param {string } Play module名称，开启命名空间后会以name为命名空间
 * @param {boolean } dynamic 动态加载(简而言之只有在用到当前的module才会加载)
 * @param {boolean } namespaced 是否开启命名空间，如果你的模块很多，强烈建议开启
 * @param {boolean } preserveState 是否启用持久化存储，防止页面刷新属性丢失(适用于h5端)
 * @param {object } store 挂载的store目标
 */
// @Module({name: 'MyListen', dynamic: true, namespaced: true, preserveState: config.preserveState, store})
@Module({name: 'MyListen', dynamic: true, namespaced: true, store})
class MyListen extends VuexModule implements MyListenKey {
  public current: number = 0 //我听页面的组件导航

  @Mutation
	public setState(obj: any) {
		(this as any)[obj.state] = obj.value;
	}

  @Action
  public changeState(parames: any){
    this.setState({state: parames.key, value: parames.value })
  }

}

export const MyListenModule = getModule(MyListen);

