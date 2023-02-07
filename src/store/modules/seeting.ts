import { VuexModule, Module, Action, Mutation, getModule} from 'vuex-module-decorators'
import store from '@/store'
import config from 'config.ts'

export interface seetingKey{}

/**
 * @title Module装饰器
 * @param {string } Seeting module名称，开启命名空间后会以name为命名空间
 * @param {boolean } dynamic 动态加载(简而言之只有在用到当前的module才会加载)
 * @param {boolean } boolean 是否开启命名空间，如果你的模块很多，强烈建议开启
 * @param {boolean } preserveState 是否启用持久化存储，防止页面刷新属性丢失(适用于h5端)
 * @param {object } store 挂载的store目标
 */
@Module({name: 'Seeting', dynamic: true ,namespaced: true, preserveState: config.preserveState, store})
// @Module({name: 'Seeting', dynamic: true ,namespaced: true, store})
class Seeting extends VuexModule implements seetingKey{
  public showTabbar: boolean = true //是否展示tabbar
  public loadMore: boolean = false //允许组件中的分页可以加载更多
  public write_show: boolean = false //控制play页面评论组件的显示与隐藏

  public homePage: number = 1 //首页专辑列表的页码
  
  public isTimer: boolean = false // 是否开启播放集数的倒数
  public timerCount: number = 0 //定时播放(倒数第0集表示)

  //app默认的主题配置
  public theme = {
    name: 'dark' as string,//主题模式
    bcgColor: '#202020' as string,//主题背景色
    borderColor: 'rgba(255,255,255, 0.06)' as string,//边框颜色
    img: '~@/static/image/themeNight.webp' as string,//主题图片
    fontColor: '#ffffff' as string,//字体颜色
  } 

  //应用于.page的内联样式对象
  public initTheme = {
    color: '' as string,//字体颜色
  }

  @Mutation
	public setState(obj: any) {
		(this as any)[obj.state] = obj.value;
	}

  @Action
  public changeTheme(){
    let obj = {
      color: this.theme.fontColor, 
    }
    
    //dark模式下的未选中tabbar图标需为白色
    let arr: string[] = ['home', 'listen', 'play', 'mine']
    arr.map((item: string, index: number)=>{
      uni.setTabBarItem({
        index: index,
        iconPath: `/static/image/tabbar/${item}_${this.theme.name === 'dark' ? 3 : 1 }.png`,
      })
    })

    this.setState({state: 'initTheme', value: obj})
  }
}

export const SeetingModule = getModule(Seeting)