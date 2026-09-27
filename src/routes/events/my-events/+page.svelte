<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>My Events — DOGFOOD</title>
</svelte:head>

<div class="page">
	<header class="header">
		<div>
			<p class="eyebrow">ORGANIZER / EVENTS</p>
			<h1>My events.</h1>
			<p class="intro">
				Create, configure, and manage your hackathon events.
			</p>
		</div>

		<form method="POST" action="/events/new">
			<button type="submit" class="button primary">
				+ Add event
			</button>
		</form>
	</header>

	<div class="toolbar">
		<span>{data.events.length} event{data.events.length === 1 ? '' : 's'}</span>

		<a href="/events" class="back-link">
			← View all events
		</a>
	</div>

	{#if data.events.length === 0}
		<section class="empty-state">
			<p class="empty-number">01</p>
			<h2>No events yet.</h2>
			<p>
				Create your first event to start configuring teams, submissions,
				tracks, and judging.
			</p>

			<form method="POST" action="/events/new">
				<button type="submit" class="button primary">
					Create your first event →
				</button>
			</form>
		</section>
	{:else}
		<section class="events-list">
			{#each data.events as event, index}
				<article class="event-card">
					<div class="event-index">
						{String(index + 1).padStart(2, '0')}
					</div>

					<div class="event-main">
						<div class="event-top">
							<div>
								<p class="status {event.status}">
									{event.status === 'live' ? 'LIVE' : 'DRAFT'}
								</p>

								<h2>{event.name || 'Untitled event'}</h2>

								{#if event.tagline}
									<p class="tagline">{event.tagline}</p>
								{/if}
							</div>

							<a href={`/events/${event.id}`} class="edit-link">
								Edit event →
							</a>
						</div>

						<div class="event-details">
							<div>
								<span>Team size</span>
								<strong>
									{event.minTeamSize}–{event.maxTeamSize}
								</strong>
							</div>

							<div>
								<span>Applications</span>
								<strong>
									{#if event.applicationOpenAt && event.applicationCloseAt}
										{new Date(event.applicationOpenAt).toLocaleDateString()}
										–
										{new Date(event.applicationCloseAt).toLocaleDateString()}
									{:else}
										Not configured
									{/if}
								</strong>
							</div>

							<div>
								<span>Judging</span>
								<strong>
									{#if event.judgingStartAt && event.judgingDeadline}
										{new Date(event.judgingStartAt).toLocaleDateString()}
										–
										{new Date(event.judgingDeadline).toLocaleDateString()}
									{:else}
										Not configured
									{/if}
								</strong>
							</div>

							<div>
								<span>Created</span>
								<strong>
									{new Date(event.createdAt).toLocaleDateString()}
								</strong>
							</div>
						</div>
					</div>
				</article>
			{/each}
		</section>
	{/if}
</div>

<style>
	:global(body) {
		margin: 0;
		background: #f3f0e8;
		color: #111;
		font-family:
			Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
			"Segoe UI", sans-serif;
	}

	.page {
		max-width: 1200px;
		margin: 0 auto;
		padding: 72px 32px 100px;
	}

	.header {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 40px;
		margin-bottom: 48px;
	}

	.eyebrow {
		margin: 0 0 12px;
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.12em;
	}

	h1 {
		margin: 0;
		font-size: clamp(48px, 8vw, 96px);
		line-height: 0.9;
		letter-spacing: -0.06em;
	}

	.intro {
		max-width: 520px;
		margin: 24px 0 0;
		font-size: 18px;
		line-height: 1.5;
	}

	.button {
		border: 2px solid #111;
		background: transparent;
		color: #111;
		padding: 14px 20px;
		font: inherit;
		font-weight: 700;
		cursor: pointer;
		text-decoration: none;
		display: inline-block;
	}

	.button.primary {
		background: #111;
		color: #f3f0e8;
	}

	.button:hover {
		transform: translateY(-2px);
	}

	.toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-top: 2px solid #111;
		border-bottom: 2px solid #111;
		padding: 14px 0;
		margin-bottom: 24px;
		font-size: 14px;
		font-weight: 700;
	}

	.back-link {
		color: #111;
		text-decoration: none;
	}

	.events-list {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.event-card {
		display: grid;
		grid-template-columns: 72px 1fr;
		border: 2px solid #111;
		background: #f3f0e8;
	}

	.event-index {
		border-right: 2px solid #111;
		padding: 24px 16px;
		font-size: 14px;
		font-weight: 700;
	}

	.event-main {
		padding: 24px;
	}

	.event-top {
		display: flex;
		justify-content: space-between;
		gap: 24px;
	}

	.status {
		display: inline-block;
		margin: 0 0 12px;
		padding: 5px 8px;
		border: 1px solid #111;
		font-size: 11px;
		font-weight: 800;
		letter-spacing: 0.08em;
	}

	.status.live {
		background: #111;
		color: #f3f0e8;
	}

	.status.draft {
		background: transparent;
	}

	h2 {
		margin: 0;
		font-size: 32px;
		line-height: 1;
		letter-spacing: -0.03em;
	}

	.tagline {
		margin: 10px 0 0;
		font-size: 16px;
	}

	.edit-link {
		color: #111;
		font-weight: 700;
		white-space: nowrap;
	}

	.event-details {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 16px;
		margin-top: 32px;
		padding-top: 20px;
		border-top: 1px solid #111;
	}

	.event-details div {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.event-details span {
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.event-details strong {
		font-size: 14px;
		font-weight: 600;
	}

	.empty-state {
		border: 2px solid #111;
		padding: 56px 32px;
		max-width: 700px;
	}

	.empty-number {
		margin: 0 0 24px;
		font-weight: 700;
	}

	.empty-state h2 {
		font-size: 48px;
	}

	.empty-state p:not(.empty-number) {
		max-width: 520px;
		line-height: 1.6;
		margin-bottom: 28px;
	}

	@media (max-width: 800px) {
		.page {
			padding: 40px 20px 72px;
		}

		.header {
			align-items: flex-start;
			flex-direction: column;
		}

		.event-details {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 560px) {
		.event-card {
			grid-template-columns: 1fr;
		}

		.event-index {
			border-right: 0;
			border-bottom: 2px solid #111;
		}

		.event-top {
			flex-direction: column;
		}

		.event-details {
			grid-template-columns: 1fr;
		}
	}
</style>