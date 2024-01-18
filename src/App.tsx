import type { Component } from 'solid-js'

import styles from './App.module.css'
import WoodenFish from './assets/WoodenFish.svg'

import { store, setStore } from './store'
import { useCreateBGM, useSound } from './composables/useSound'

const [zoom, setZoom] = createSignal(false)
const [show, setShow] = createSignal(false) // 设置 Settings 显隐

const bgm = useCreateBGM(store.volume / 100)
const sound = new useSound(store.sound)

const isPC =
  !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )

function handle() {
  sound.play()
  setStore('count', store.count + 1)
  setZoom(true)
}
function release() {
  setZoom(false)
}

function handleBGM() {
  if (!bgm.playing()) bgm.play()
  else bgm.pause()
}

function debounce(func, timeout = 350){
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}

var motionAction = debounce(() => {handle(); release()})

var keyDownAction = debounce(() => {handle()})


// 绑定全局 keyboard 事件
document.onkeydown = handleKeyBoard
document.onkeyup = handleKeyBoard
function handleKeyBoard({ key, code, type }: KeyboardEvent) {
  if (key !== ' ' || code !== 'Space') return
  type === 'keydown' ? keyDownAction() : release()
}


var lastBeta = 0;

window.addEventListener('deviceorientation', function(event) {
  var beta = event.beta;

  if (lastBeta - beta > 5) {
    motionAction()
  }
  lastBeta = beta;
});

const App: Component = () => {
  // 监听控制声音变化
  createEffect(() => bgm.volume(store.volume / 100))
  // 监听点击音效切换
  createEffect(() => sound.changeHowl(store.sound))

  return (
    <div
      w-100vw
      h-100vh
      px-6
      md:px-10
      py-4
      md:py-6
      text-center
      bg='#111'
      color-white
      flex='~ col'
      justify-between
      select-none
      overflow-hidden
      style={{
        'font-family': "'Roboto', sans-serif"
      }}>
      <header>
        <div flex justify-between items-center>
          <Title />
          <div text-2xl flex items-center gap-2>
            <i
              i-carbon-music
              inline-block
              cursor-pointer
              onClick={handleBGM}></i>
            <i
              i-carbon-settings
              inline-block
              cursor-pointer
              onClick={() => setShow(true)}></i>
          </div>
        </div>
        <div
          text-10rem
          font-bold
          transition-300
          style={{
            'line-height': 1,
            'font-family': "'Pacifico', cursive",
            transform: `scale(${zoom() ? 1.1 : 1})`
          }}>
          {store.count}
        </div>
        <div
          color='#444'
          text-xl
          mt-2
          font-bold
          style={{
            'font-family': "'Pacifico', cursive"
          }}>
          功德
        </div>
      </header>

      <main flex justify-center>
        <img
          src={WoodenFish}
          alt='WoodenFish'
          onMouseDown={isPC ? keyDownAction : () => {}}
          onMouseUp={isPC ? release : () => {}}
          // disable click event of mobile device
          //onTouchStart={handle}
          //onTouchEnd={release}
          transition-300
          cursor-pointer
          draggable={false}
          style={{
            transform: `scale(${zoom() ? 0.99 : 1})`,
            '-webkit-tap-highlight-color': 'transparent'  // 清除移动端 touch 高亮效果
          }}
        />
      </main>

      <footer color='#444'>
        <div font-bold text-sm>
          <Show when={isPC}>
          <div mb='1.5'>
            按下
            <code class={styles.code}>Space</code>或
            <code class={styles.code}>Click</code>
            积攒功德
          </div>
          </Show>
          <Show when={!isPC}>
          <div mb='1.5'>
            把你的移动设备想象成木鱼棒,用力敲起来吧!
          </div>
          </Show>
          <div mb='1.5'>
            推荐到<a color="#66ccff" href='https://1link.fun'><bold>我的科技周刊</bold></a>探索更多好玩的内容
          </div>
          <div>
            点击
            <code class={styles.code}>
              右上角
              <i
                i-carbon-music
                inline-block
                text='0.6rem'
                v-middle
                ml='0.4'></i>
            </code>
            开启/关闭 沉浸模式
          </div>
        </div>
      </footer>
      <Show when={show()}>
        <Settings onClose={() => setShow(false)} />
      </Show>
    </div>
  )
}

export default App
