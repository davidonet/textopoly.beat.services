<script>
  import { page } from '$app/stores'
  import { goto } from '$app/navigation'
  import { onMount } from 'svelte'
  import '$lib/scss/zooms.scss'
  import { getStepX, getStepY, getL } from './utils.js'
  import logo from '../assets/full_logo.svg'
  import map from '../assets/map.avif'

  let isDragging = false
  let x = 0
  let y = 0
  let zoom = 4
  let innerWidth = 0
  let innerHeight = 0
  let stepx = 0
  let stepy = 0
  let soundcloud = ''
  let soundcloudIframe
  let showMap = false
  let touchX = 0
  let touchY = 0
  let canZoom = false
  let newZoom = 4

  const zooms = [1, 2, 4, 10, 20, 40]

  function touchstart(e) {
    touchX = e.touches[0].clientX
    touchY = e.touches[0].clientY
    canZoom = true
  }

  function touchmove(e) {
    if (e.touches.length == 1) {
      x += (e.touches[0].clientX - touchX) / stepx
      y += (e.touches[0].clientY - touchY) / stepy
      touchX = e.touches[0].clientX
      touchY = e.touches[0].clientY
      return false
    }
    if (e.touches.length == 2) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const x1 = touch1.clientX
      const y1 = touch1.clientY
      const x2 = touch2.clientX
      const y2 = touch2.clientY
      const distance = (x2 - x1 + (y2 - y1)) / 2
      if (canZoom && 50 < Math.abs(distance)) {
        const i = zooms.indexOf(zoom)
        if (i === -1) return
        canZoom = false
        if (0 < distance && i < zooms.length - 1) {
          newZoom = zooms[i + 1]
        } else if (distance < 0 && i > 0) {
          newZoom = zooms[i - 1]
        }
      }
    }
  }

  function touchend(e) {
    const centerX = (innerWidth / (2 * stepx) - x).toFixed(2)
    const centerY = (innerHeight / (2 * stepy) - y).toFixed(2)
    goto(`?z=${newZoom}&x=${centerX}&y=${centerY}`)
  }

  function mousedown(e) {
    isDragging = true
  }

  function mousemove(e) {
    if (isDragging) {
      x += e.movementX / stepx
      y += e.movementY / stepy
    }
  }

  function mouseup(e) {
    isDragging = false
    const centerX = (innerWidth / (2 * stepx) - x).toFixed(2)
    const centerY = (innerHeight / (2 * stepy) - y).toFixed(2)
    goto(`?z=${zoom}&x=${centerX}&y=${centerY}`)
  }

  onMount(() => {
    page.subscribe((p) => {
      const centerX = parseFloat(p.url.searchParams.get('x')) || 8.11
      const centerY = parseFloat(p.url.searchParams.get('y')) || 12.12
      zoom = parseInt($page.url.searchParams.get('z')) || 4
      innerWidth = window.innerWidth
      innerHeight = window.innerHeight
      stepx = getStepX(zoom)
      stepy = getStepY(zoom)
      x = innerWidth / (2 * stepx) - centerX
      y = innerHeight / (2 * stepy) - centerY
    })
  })

  function wheelZoom(e) {
    const delta = Math.sign(e.deltaY)
    const i = zooms.indexOf(zoom)
    if (i === -1) return
    if (delta > 0 && i < zooms.length - 1) {
      goto(`?z=${zooms[i + 1]}&x=${centerX}&y=${centerY}`)
    } else if (delta < 0 && i > 0) {
      goto(`?z=${zooms[i - 1]}&x=${centerX}&y=${centerY}`)
    }
  }

  function playSoundcloud(url) {
    soundcloud = url
    setTimeout(() => {
      const widget = SC.Widget(soundcloudIframe)
      widget.play()
      widget.bind(SC.Widget.Events.FINISH, () => {
        soundcloud = ''
      })
    }, 1000)
  }

  function mapClick(e) {
    const rect = e.target.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const newX = ((x - 0.15) / 0.58) * 2500
    const newY = ((y - 0.5) / 0.4) * 584
    showMap = false
    goto(`?z=${zoom}&x=${newX}&y=${newY}`)
  }

  $: centerX = (innerWidth / (2 * stepx) - x).toFixed(2)
  $: centerY = (innerHeight / (2 * stepy) - y).toFixed(2)
</script>

<svelte:window
  on:mousemove={mousemove}
  on:mousedown={mousedown}
  on:mouseup={mouseup}
  on:wheel={wheelZoom}
  on:touchstart={touchstart}
  on:touchmove={touchmove}
  on:touchend={touchend} />

<div class="header">
  <div
    class="textopoly"
    on:click={() => {
      showMap = !showMap
    }}>
    TEXTOPOLY
  </div>
  <div style="margin-left: auto; margin-right:32px">
    <div style="display:flex;align-items: center;">
      <button on:click={() => goto(`?z=1&x=${centerX}&y=${centerY}`)}>
        z1
      </button>
      <button on:click={() => goto(`?z=2&x=${centerX}&y=${centerY}`)}>
        z2
      </button>
      <button on:click={() => goto(`?z=4&x=${centerX}&y=${centerY}`)}>
        z4
      </button>
      <button on:click={() => goto(`?z=10&x=${centerX}&y=${centerY}`)}>
        z10
      </button>
      <button on:click={() => goto(`?z=20&x=${centerX}&y=${centerY}`)}>
        z20
      </button>
      <button on:click={() => goto(`?z=40&x=${centerX}&y=${centerY}`)}>
        z40
      </button>
    </div>
  </div>
</div>

{#if showMap}
  <div class="map" on:click={mapClick}>
    <img src={map} alt="map" width="100%" />
  </div>
{/if}

<div id="map" class="z{zoom}">
  {#each $page.data.txts as txt}
    {#if txt.t && txt.t.includes('soundcloud.com')}
      {#if zoom < 20}
        <div
          class={`soundcloud ${getL(txt.t)} ${txt.s}`}
          style={`left: ${Math.round((x + txt.p[0]) * stepx)}px;top: ${Math.round((y + txt.p[1]) * stepy)}px;background-color: ${txt.c};`}
          on:click={playSoundcloud.bind(this, txt.t)}>
          <div>
            <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
            <img
              src="img/soundcloud.svg"
              alt="soundcloud"
              width="30%"
              draggable="false"
              on:click={playSoundcloud.bind(this, txt.t)} />
          </div>
        </div>
      {:else}
        <div
          class={`msg ${getL(txt.t)} ${txt.s}`}
          style={`left: ${Math.round((x + txt.p[0]) * stepx)}px;top: ${Math.round((y + txt.p[1]) * stepy)}px;background-color: ${txt.c};`}>
          <p>&nbsp;</p>
        </div>
      {/if}
    {:else}
      <div
        class={`msg ${getL(txt.t)} ${txt.s}`}
        style={`left: ${Math.round((x + txt.p[0]) * stepx)}px;top: ${Math.round((y + txt.p[1]) * stepy)}px;background-color: ${txt.c};`}>
        {#if txt.t}
          {#if zoom < 20}
            <p>{txt.t}</p>
          {:else}
            <p>&nbsp;</p>
          {/if}
        {:else if zoom < 10}
          <img
            src="img/{txt.id}.avif"
            alt={txt.id}
            width="100%"
            height="100%" />
        {:else}
          <img
            src="img/s/{txt.id}.avif"
            alt={txt.id}
            width="100%"
            height="100%" />
        {/if}
      </div>
    {/if}
  {/each}
</div>
<!-- svelte-ignore a11y-missing-attribute -->
{#if soundcloud.includes('soundcloud.com')}
  <iframe
    bind:this={soundcloudIframe}
    width="256px"
    height="100px"
    scrolling="no"
    frameborder="no"
    allow="autoplay"
    src="https://w.soundcloud.com/player/?url={soundcloud}"
    style="position:fixed;bottom:0;right:0;z-index:2000">
  </iframe>
{/if}

<img
  src={logo}
  alt="logo"
  class="logo"
  on:click={() => {
    window.location = 'https://xn--b-bga.at/'
  }} />

<style>
  .msg {
    position: absolute;
    font-family: 'NotCourierSans';
    overflow-wrap: break-word;
    pointer-events: none;
    z-index: -100;
  }
  #map {
    position: fixed;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 500;
    cursor: move;
  }
  .soundcloud {
    position: absolute;
    z-index: 100;
    pointer-events: click;
    cursor: pointer;
  }
  .soundcloud > div {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }
  .logo {
    position: fixed;
    bottom: 12px;
    left: 16px;
    z-index: 1000;
    width: 128px;
    pointer-events: click;
    cursor: pointer;
  }
  .header {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
    width: 100%;
    height: 32px;
    background-color: rgb(95, 100, 90);
    font-size: 24px;
    font-weight: bold;
    display: flex;
    align-items: center;
    padding-left: 16px;
    color: rgba(206, 210, 202, 1);
  }
  .header button {
    border: none;
    font-size: 12px;
    font-weight: bold;
    cursor: pointer;
    border-radius: 6px;
    margin-left: 8px;
  }
  .map {
    position: fixed;
    top: 32px;
    width: 100%;
    z-index: 1000;
    background-color: rgba(206, 210, 202, 1);
    cursor: crosshair;
  }
  .textopoly {
    cursor: pointer;
  }
</style>
