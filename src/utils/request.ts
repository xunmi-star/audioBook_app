import storage from '@/utils/storage'
//请求处理
import Request from 'luch-request';

const http = new Request();

/**
 * 请求方式
 * this.$httpRequest.get(url,{params,header})
 * this.$httpRequest.post(url,data,{header})
 */

// Request interceptors 请求拦截器
http.interceptors.request.use((config: any) => {
	config.baseURL = process.env.VUE_APP_BASE_API;
	config.header = {
		...config.header,
		// 将token 放入header
		Authorization: uni.getStorageSync('token') ? `Bearer ${uni.getStorageSync(storage.keysObj.token)}` : '',	
	};
	return config;
});

// Request interceptors 响应拦截器
http.interceptors.response.use(
	(response: any) => {
		// console.log('response1:',response)
		const res = response.data;
		if (res.code !== 200) {
			uni.showToast({
				title: res.message || res.msg,
				duration: 2000,
				icon: 'none'
			});

			// 重新登录
			if (res.code == 401) {
				//函数防抖 处理短时间内多次弹出重新登陆窗口
				(uni as any).$u.debounce(()=>{
					uni.showModal({
						title: '提示',
						content: res.msg,
						confirmText: '重新登入',
						confirmColor: '#007aff',
						showCancel: true,
						success: res => {
							if (res.confirm) {
								uni.removeStorageSync(storage.keysObj.token)
								uni.redirectTo({url: '/pages/account/login'})
							}
						}
					})
				}, 500)
			}
			return Promise.reject(res);
		} else {
			// console.log('请求成功', response);
			return res;
		}
	},
	(response: any) => {
		/*  对响应错误做点什么 （statusCode !== 200）*/
		console.log('错误的响应:', response)
		if (response.errMsg == 'request:fail abort' || response.errMsg == 'request:fail abort statusCode:-1') {
			uni.showToast({
				title: '请求超时',
				duration: 2000,
				icon: 'none',
				position: 'top'
			});
		}
		return Promise.reject(response);
	}
);

export default{
	http,
}



