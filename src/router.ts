import { RouterMount, createRouter } from 'uni-simple-router';

import { SeetingModule } from '@/store/modules/seeting'

const router = createRouter({
	platform: process.env.VUE_APP_PLATFORM,  
	routes: [...ROUTES] 
});


//全局路由前置守卫
router.beforeEach((to, from, next) => {
	//前往播放页面时，关闭tabbar
	if(to.path == '/pages/play/index'){
		SeetingModule.setState({state: 'showTabbar', value: false}) 
	}
	SeetingModule.setState({state: 'showTabbar', value: true}) 
	next();
});
// 全局路由后置守卫
router.afterEach((to, from) => {
    // console.log('跳转结束')
})

export {
	router,
	RouterMount
}