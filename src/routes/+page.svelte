<script>
  import { page } from '$app/stores'
  import { goto } from '$app/navigation'
  import { useLazyImage as lazyImage } from 'svelte-lazy-image'
  import '$lib/scss/zooms.scss'
  import { onMount } from 'svelte'

  let isDragging = false
  let x = 0
  let y = 0
  let zoom = 10
  let innerWidth = 0
  let innerHeight = 0
  let stepx = 0
  let stepy = 0

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
    const centerX = Math.round(innerWidth / (2 * stepx) - x)
    const centerY = Math.round(innerHeight / (2 * stepy) - y)
    goto(`?z=${zoom}&x=${centerX}&y=${centerY}`)
  }

  onMount(() => {
    page.subscribe((p) => {
      const centerX = parseInt(p.url.searchParams.get('x')) || 0
      const centerY = parseInt(p.url.searchParams.get('y')) || 0
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
    const centerX = Math.round(innerWidth / (2 * stepx) - x)
    const centerY = Math.round(innerHeight / (2 * stepy) - y)
    if (delta > 0 && i < zooms.length - 1) {
      goto(`?z=${zooms[i + 1]}&x=${centerX}&y=${centerY}`)
    } else if (delta < 0 && i > 0) {
      goto(`?z=${zooms[i - 1]}&x=${centerX}&y=${centerY}`)
    }
  }
</script>

<svelte:window on:mousemove={mousemove} />

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  id="map"
  class="z{zoom}"
  on:mousedown={(e) => {
    isDragging = true
  }}
  on:mouseup={mouseup}
  on:wheel={wheelZoom}>
  {#each $page.data.txts as txt}
    <div
      class={`msg ${getL(txt.t)} ${txt.s}`}
      style={`left: ${(x + txt.p[0]) * stepx}px; top: ${(y + txt.p[1]) * stepy}px; background-color: ${txt.c};`}>
      {#if txt.t}
        {#if zoom < 20}
          <p>{txt.t}</p>
        {:else}
          <p>&nbsp;</p>
        {/if}
      {:else if zoom < 10}
        <img src="img/{txt.id}.avif" alt={txt.id} width="100%" height="100%" />
      {:else}
        <img
          src="img/{txt.id}.avif?s=1"
          alt={txt.id}
          width="100%"
          height="100%" />
      {/if}
    </div>
  {/each}
</div>

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
</style>
