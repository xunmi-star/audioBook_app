import { VuexModule, Module, Action, Mutation, getModule } from 'vuex-module-decorators';
import store from '@/store';
import storage from '@/utils/storage'
import config from 'config.ts'

export interface IUserState {
	token: string;
	type: string;
	name: string;
	avatar: string;
}


let preserveState = false
// #ifdef H5
preserveState = localStorage.getItem('vuex') !== null
// #endif
/**
 * @title Module装饰器
 * @param {string } Play module名称，开启命名空间后会以name为命名空间
 * @param {boolean } dynamic 动态加载(简而言之只有在用到当前的module才会加载)
 * @param {boolean } namespaced 是否开启命名空间，如果你的模块很多，强烈建议开启
 * @param {boolean } preserveState 是否启用持久化存储，防止页面刷新属性丢失(适用于h5端)
 * @param {object } store 挂载的store目标
 */
@Module({name: 'User', dynamic: true,namespaced: true, preserveState: config.preserveState, store})
class User extends VuexModule implements IUserState {
	public token = '';
	public code = '';
	public type = '';
	public name = '';
	public avatar = '';

	@Mutation
	public setState(obj: any) {
		(this as any)[obj.state] = obj.value;
	}

	@Action
	public async Login(loginInfo: object) {

	}

	@Action
	public resetToken(token: string) {
		uni.setStorageSync(storage.keysObj.token, token)
		this.setState({ state: 'token', value: token });
	}

	@Action
	public async logOut() {
		if (!this.token) {
			throw Error('LogOut: token is undefined!');
		}	
		storage.setStorage('UserModule', 'token', '')
	}
}

export const UserModule = getModule(User);
