<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Public Gallery — DOGFOOD</title>
	<meta
		name="description"
		content="Browse submitted DOGFOOD projects."
	/>
</svelte:head>

<div class="page">
	<header>
		<a href="/">← DOGFOOD</a>
		<span>PUBLIC GALLERY</span>
	</header>

	<main>
		<div class="heading">
			<p class="eyebrow">PUBLIC GALLERY</p>

			<h1>What<br />was built.</h1>
		</div>

		<form method="GET" class="filters">
			<input
				name="q"
				value={data.search}
				placeholder="Search projects…"
			/>

			<select name="track">
				<option value="">All tracks</option>

				{#each data.tracks as track}
					<option
						value={track.id}
						selected={track.id === data.trackId}
					>
						{track.name}
					</option>
				{/each}
			</select>

			<button type="submit">Filter →</button>
		</form>

		<div class="grid">
			{#each data.projects as project}
				<article>
					<div class="meta">
						<span>{project.trackName}</span>
						<span>{project.eventName}</span>
					</div>

					<h2>{project.name}</h2>

					{#if project.tagline}
						<p class="tagline">
							{project.tagline}
						</p>
					{/if}

					<p>
						{project.description}
					</p>

					<div class="bottom">
						<span>{project.teamName}</span>

						<div>
							{#if project.repoUrl}
								<a
									href={project.repoUrl}
									target="_blank"
									rel="noreferrer"
								>
									REPO
								</a>
							{/if}

							{#if project.demoVideoUrl}
								<a
									href={project.demoVideoUrl}
									target="_blank"
									rel="noreferrer"
								>
									DEMO
								</a>
							{/if}
						</div>
					</div>
				</article>
			{:else}
				<div class="empty">
					No submitted projects match
					these filters.
				</div>
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
		max-width: 1300px;
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
		line-height: 0.78;
		margin: 1rem 0 4rem;
	}

	.filters {
		display: grid;
		grid-template-columns: 2fr 1fr auto;
		gap: 0.75rem;
		margin-bottom: 3rem;
	}

	input,
	select {
		border: 2px solid #111;
		background: white;
		padding: 1rem;
		font: inherit;
	}

	button {
		border: 2px solid #111;
		background: #111;
		color: #f3f0e8;
		padding: 1rem 1.5rem;
		font: inherit;
		font-weight: 900;
		cursor: pointer;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(
			auto-fit,
			minmax(300px, 1fr)
		);
		gap: 1rem;
	}

	article {
		border: 2px solid #111;
		padding: 1.5rem;
		min-height: 330px;
		display: flex;
		flex-direction: column;
	}

	.meta {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		font-size: 0.7rem;
		font-weight: 900;
		text-transform: uppercase;
	}

	h2 {
		font-size: 2rem;
		margin-top: 4rem;
	}

	.tagline {
		font-weight: 800;
	}

	article > p {
		line-height: 1.5;
	}

	.bottom {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		align-items: end;
		margin-top: auto;
		padding-top: 2rem;
		font-weight: 900;
	}

	.bottom div {
		display: flex;
		gap: 1rem;
	}

	.bottom a {
		color: inherit;
	}

	.empty {
		border: 2px solid #111;
		padding: 3rem;
		font-weight: 900;
	}

	@media (max-width: 700px) {
		.filters {
			grid-template-columns: 1fr;
		}
	}
</style>