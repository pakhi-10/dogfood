<script lang="ts">
	type Event = {
		name: string;
		slug: string;
		description: string;
		status: 'live' | 'upcoming' | 'completed';
		date: string;
	};

	let { event }: { event: Event } = $props();
</script>

<a href={`/events/${event.slug}`} class="card">
	<div class="top">
		<span class="status">
			<span class:live={event.status === 'live'} class="dot"></span>
			{event.status}
		</span>

		<span class="date">{event.date}</span>
	</div>

	<div class="content">
		<h3>{event.name}</h3>

		<p>{event.description}</p>
	</div>

	<div class="bottom">
		<span>View event</span>
		<span class="arrow">↗</span>
	</div>
</a>

<style>
	.card {
		min-height: 320px;
		padding: 24px;

		display: flex;
		flex-direction: column;

		border: 1px solid #d5d5ce;
		background: #f8f8f5;

		transition:
			background 0.15s ease,
			transform 0.15s ease;
	}

	.card:hover {
		background: #eeeeea;
		transform: translateY(-3px);
	}

	.top {
		display: flex;
		justify-content: space-between;
		gap: 15px;
	}

	.status {
		display: flex;
		align-items: center;
		gap: 7px;

		font-size: 0.7rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: #aaa;
	}

	.dot.live {
		background: #111;
	}

	.date {
		font-size: 0.75rem;
		color: #777;
	}

	.content {
		margin-top: auto;
		margin-bottom: 40px;
	}

	h3 {
		margin: 0 0 12px;

		font-size: 1.8rem;
		line-height: 1;
		letter-spacing: -0.05em;
	}

	p {
		max-width: 320px;
		margin: 0;

		color: #666;
		font-size: 0.9rem;
		line-height: 1.55;
	}

	.bottom {
		display: flex;
		justify-content: space-between;

		padding-top: 16px;
		border-top: 1px solid #d5d5ce;

		font-size: 0.78rem;
		font-weight: 600;
		color: #666;
	}

	.arrow {
		color: #111;
		font-size: 1rem;
	}
</style>