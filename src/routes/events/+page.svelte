<script lang="ts">
	let { data } = $props();

	function status(event: {
		applicationOpenAt: Date | null;
		applicationCloseAt: Date | null;
	}) {
		const now = new Date();

		if (
			event.applicationOpenAt &&
			now < new Date(event.applicationOpenAt)
		) {
			return 'Upcoming';
		}

		if (
			event.applicationCloseAt &&
			now > new Date(event.applicationCloseAt)
		) {
			return 'Ended';
		}

		return 'Active';
	}
</script>

<svelte:head>
	<title>Events — DOGFOOD</title>
</svelte:head>

<div class="page">
	<header>
		<a href="/">← DOGFOOD</a>
		<a href="/projects">PUBLIC GALLERY →</a>
	</header>

	<main>
		<p class="eyebrow">EVENTS</p>

		<h1>Find an<br />event.</h1>

		<div class="events">
			{#each data.events as event}
				<a class="event" href={`/events/${event.id}`}>
					<div class="top">
						<span>{status(event)}</span>
						<span>→</span>
					</div>

					<h2>{event.name}</h2>

					{#if event.tagline}
						<p>{event.tagline}</p>
					{:else if event.about}
						<p>{event.about}</p>
					{/if}
				</a>
			{:else}
				<p>No events have been created yet.</p>
			{/each}
		</div>
	</main>
</div>

<style>
	.page {
		min-height: 100vh;
		background: #f3f0e8;
		color: #111;
	}

	header {
		display: flex;
		justify-content: space-between;
		padding: 1.5rem 2rem;
		border-bottom: 2px solid #111;
		font-weight: 900;
	}

	header a {
		color: inherit;
		text-decoration: none;
	}

	main {
		max-width: 1200px;
		margin: auto;
		padding: 5rem 2rem;
	}

	.eyebrow {
		font-size: 0.75rem;
		font-weight: 900;
		letter-spacing: 0.12em;
	}

	h1 {
		font-size: clamp(4rem, 12vw, 10rem);
		line-height: 0.8;
		margin: 1rem 0 5rem;
	}

	.events {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1rem;
	}

	.event {
		display: block;
		color: inherit;
		text-decoration: none;
		border: 2px solid #111;
		padding: 1.5rem;
		min-height: 280px;
	}

	.event:hover {
		background: #111;
		color: #f3f0e8;
	}

	.top {
		display: flex;
		justify-content: space-between;
		font-size: 0.75rem;
		font-weight: 900;
	}

	h2 {
		font-size: 2rem;
		margin-top: 5rem;
	}

	p {
		line-height: 1.5;
	}
</style>