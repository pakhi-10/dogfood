<script lang="ts">
	let { data, form } = $props();

	let selectedEvent = $state('');

	let availableTracks = $derived(
		data.tracks.filter(
			(track: { eventId: string }) =>
				track.eventId === selectedEvent
		)
	);
</script>

<svelte:head>
	<title>New Submission — DOGFOOD</title>
</svelte:head>

<div class="page">
	<header>
		<a href="/">← DOGFOOD</a>
		<span>NEW SUBMISSION</span>
	</header>

	<main>
		<p class="eyebrow">PROJECT SUBMISSION</p>

		<h1>Build your<br />entry.</h1>

		<p class="intro">
			Save a draft while you work. Submission is only
			final when you explicitly submit before the event
			deadline.
		</p>

		{#if form?.error}
			<div class="error">{form.error}</div>
		{/if}

		<form method="POST">
			<label>
				Event
				<select
					name="eventId"
					bind:value={selectedEvent}
					required
				>
					<option value="">
						Select an event
					</option>

					{#each data.events as event}
						<option value={event.id}>
							{event.name}
						</option>
					{/each}
				</select>
			</label>

			<label>
				Track
				<select name="trackId" required>
					<option value="">
						Select a track
					</option>

					{#each availableTracks as track}
						<option value={track.id}>
							{track.name}
						</option>
					{/each}
				</select>
			</label>

			<label>
				Project name
				<input
					name="projectName"
					maxlength="200"
					required
				/>
			</label>

			<label>
				Tagline
				<input
					name="projectTagline"
					maxlength="500"
				/>
			</label>

			<label>
				Description
				<textarea
					name="longDescription"
					rows="10"
					required
				></textarea>
			</label>

			<label>
				Repository URL
				<input
					name="repoUrl"
					type="url"
				/>
			</label>

			<label>
				Demo video URL
				<input
					name="demoVideoUrl"
					type="url"
				/>
			</label>

			<div class="actions">
				<button
					formaction="?/saveDraft"
					type="submit"
					class="secondary"
				>
					Save draft
				</button>

				<button
					formaction="?/submit"
					type="submit"
				>
					Submit project →
				</button>
			</div>
		</form>
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
		max-width: 850px;
		margin: auto;
		padding: 5rem 2rem;
	}

	.eyebrow {
		font-size: 0.75rem;
		font-weight: 900;
		letter-spacing: 0.12em;
	}

	h1 {
		font-size: clamp(4rem, 12vw, 9rem);
		line-height: 0.8;
		margin: 1rem 0 2rem;
	}

	.intro {
		max-width: 650px;
		line-height: 1.6;
		margin-bottom: 4rem;
	}

	form {
		display: grid;
		gap: 1.5rem;
	}

	label {
		display: grid;
		gap: 0.5rem;
		font-weight: 900;
	}

	input,
	textarea,
	select {
		border: 2px solid #111;
		background: white;
		padding: 0.9rem;
		font: inherit;
	}

	.actions {
		display: flex;
		gap: 1rem;
		margin-top: 2rem;
	}

	button {
		border: 2px solid #111;
		background: #111;
		color: #f3f0e8;
		padding: 1rem 1.25rem;
		font: inherit;
		font-weight: 900;
		cursor: pointer;
	}

	button.secondary {
		background: transparent;
		color: #111;
	}

	.error {
		border: 2px solid #111;
		background: #e8b9a9;
		padding: 1rem;
		margin-bottom: 2rem;
		font-weight: 900;
	}

	@media (max-width: 650px) {
		.actions {
			flex-direction: column;
		}
	}
</style>