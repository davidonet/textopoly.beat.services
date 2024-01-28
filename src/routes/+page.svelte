<script>
  import { page } from '$app/stores'
  import { onMount } from 'svelte'
  import { useLazyImage as lazyImage } from 'svelte-lazy-image'
  import '$lib/scss/zooms.scss'

  const params = {
    zoom: 1,
    stepx: 240,
    stepy: 160,
    xcenter: 0,
    ycenter: 0,
  }

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

  function computeCellSize() {
    switch (params.zoom) {
      case 1:
        params.stepx = 240
        params.stepy = 160
        break
      case 2:
        params.stepx = 120
        params.stepy = 80
        break
      case 4:
        params.stepx = 60
        params.stepy = 40
        break
      case 10:
        params.stepx = 24
        params.stepy = 16
        break
      case 20:
        params.stepx = 12
        params.stepy = 8
        break
      case 40:
        params.stepx = 6
        params.stepy = 4
        break
    }
  }

  function computeParams() {
    computeCellSize()
    params.txtwidth = Math.ceil(innerWidth / params.stepx)
    params.txtheight = Math.ceil(innerHeight / params.stepy)
    params.xmin = Math.ceil(params.xcenter - params.txtwidth / 2)
    params.xmax = Math.ceil(params.xcenter + params.txtwidth / 2)
    params.ymin = Math.ceil(params.ycenter - params.txtheight / 2)
    params.ymax = Math.ceil(params.ycenter + params.txtheight / 2)
  }

  onMount(computeParams)

  function getClasses(txt) {
    return `msg ${getL(txt.t)} ${txt.s}`
  }

  function getStyle(txt) {
    return `left: ${txt.p[0] * params.stepx}px; top: ${txt.p[1] * params.stepy}px; background-color: ${txt.c};`
  }

  $: outerWidth = 0
  $: innerWidth = 0
  $: outerHeight = 0
  $: innerHeight = 0
</script>

<svelte:window
  bind:innerWidth
  bind:outerWidth
  bind:innerHeight
  bind:outerHeight />

<div class="z1">
  {#each $page.data.txts as txt}
    <div class={getClasses(txt)} style={getStyle(txt)}>
      {#if txt.t}
        <p>{txt.t}</p>
      {:else}
        <img
          src="img/{txt.id}.avif?s=1"
          alt={txt.id}
          width="100%"
          height="100%"
          data-src="img/{txt.id}.avif"
          use:lazyImage />
      {/if}
    </div>
  {/each}
</div>

<style>
  .msg {
    position: absolute;
    font-family: 'NotCourierSans';
    overflow-wrap: break-word;
  }
</style>
