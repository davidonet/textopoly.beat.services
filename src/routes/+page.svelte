<script>
  import { page } from '$app/stores'
  import { goto } from '$app/navigation'
  import { onMount } from 'svelte'
  import '$lib/scss/zooms.scss'

  let isDragging = false
  let x = 0
  let y = 0
  let zoom = 10
  let innerWidth = 0
  let innerHeight = 0
  let stepx = 0
  let stepy = 0
  let soundcloud = ''
  let soundcloudIframe

  const zooms = [1, 2, 4, 10, 20, 40]

  function getL(t) {
    if (t === undefined) return 'l0'
    const l = t.length
    if (l < 1) return 'l0'
    if (l < 4) return 'l4'
    if (l < 15) return 'l15'
    if (l < 50) return 'l50'
    if (l < 150) return 'l150'
    if (l < 300) return 'l300'
    return 'l600'
  }

  function getStepX(z) {
    switch (z) {
      case 1:
        return 240
      case 2:
        return 120
      case 4:
        return 60
      case 10:
        return 24
      case 20:
        return 12
      case 40:
        return 6
    }
  }

  function getStepY(z) {
    switch (z) {
      case 1:
        return 160
      case 2:
        return 80
      case 4:
        return 40
      case 10:
        return 16
      case 20:
        return 8
      case 40:
        return 4
    }
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
      const centerX = parseFloat(p.url.searchParams.get('x')) || 0
      const centerY = parseFloat(p.url.searchParams.get('y')) || 0
      zoom = parseInt($page.url.searchParams.get('z')) || 10
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
    const centerX = (innerWidth / (2 * stepx) - x).toFixed(2)
    const centerY = (innerHeight / (2 * stepy) - y).toFixed(2)
    if (delta > 0 && i < zooms.length - 1) {
      goto(`?z=${zooms[i + 1]}&x=${centerX}&y=${centerY}`)
    } else if (delta < 0 && i > 0) {
      goto(`?z=${zooms[i - 1]}&x=${centerX}&y=${centerY}`)
    }
  }

  function playSoundcloud(url) {
    soundcloud = url
    setTimeout(() => {
      SC.Widget(soundcloudIframe).play()
    }, 1000)
  }
</script>

<svelte:window
  on:mousemove={mousemove}
  on:mousedown={(e) => {
    isDragging = true
  }}
  on:mouseup={mouseup}
  on:wheel={wheelZoom} />

<div id="map" class="z{zoom}">
  {#each $page.data.txts as txt}
    {#if txt.t && txt.t.includes('soundcloud.com')}
      {#if zoom < 20}
        <div
          class={`soundcloud ${getL(txt.t)} ${txt.s}`}
          style={`left: ${Math.round((x + txt.p[0]) * stepx)}px;top: ${Math.round((y + txt.p[1]) * stepy)}px;background-color: ${txt.c};`}>
          <div>
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
    width="25%"
    height="100"
    scrolling="no"
    frameborder="no"
    allow="autoplay"
    src="https://w.soundcloud.com/player/?url={soundcloud}"
    style="position:fixed;bottom:0;right:0;z-index:2000">
  </iframe>
{/if}

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
</style>
