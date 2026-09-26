<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';

	let { data } = $props();

	const statusLabels: Record<string, string> = {
		upcoming: 'Upcoming',
		active: 'Active',
		ended: 'Ended'
	};

	const formatDate = (date: string | Date | null) => {
		if (!date) return 'TBA';

		return new Intl.DateTimeFormat('en-IN', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		}).format(new Date(date));
	};
</script>

<svelte:head>
	<title>DOGFOOD — Hackathon Platform</title>
	<meta
		name="description"
		content="An open source, self-hostable platform for running and judging hackathons."
	/>
</svelte:head>

<div class="site">
	<Navbar user={data.user} />

	<main>
		<!-- HERO -->
		<section class="hero">
			<div class="hero-meta">
				<span>DOGFOOD 2026</span>
				<span>OPEN SOURCE / SELF-HOSTABLE</span>
			</div>

			<h1>
				Build.<br />
				Submit.<br />
				Get judged.
			</h1>

			<div class="hero-bottom">
				<p>
					A complete platform for running hackathons,
					forming teams, submitting projects and judging
					real work.
				</p>

				<div class="hero-actions">
					<a href="/events" class="button primary">
						Explore events →
					</a>

					<a href="/projects" class="button">
						Public gallery
					</a>
				</div>
			</div>
		</section>

		<!-- EVENTS -->
		<section class="section">
			<div class="section-header">
				<div>
					<p class="eyebrow">01 / EVENTS</p>
					<h2>Current events.</h2>
				</div>

				<a href="/events" class="text-link">View all →</a>
			</div>

			{#if data.events.length === 0}
				<div class="empty">
					<p>No events have been created yet.</p>

					{#if data.user?.role === 'organizer' || data.user?.role === 'admin'}
						<a href="/events/new">Create an event →</a>
					{/if}
				</div>
			{:else}
				<div class="event-list">
					{#each data.events as event}
						<a href={`/events/${event.id}`} class="event-row">
							<div class="event-number">
								{String(data.events.indexOf(event) + 1).padStart(2, '0')}
							</div>

							<div class="event-main">
								<div class="event-title">
									<h3>{event.name}</h3>

									<span class={`status ${event.status}`}>
										{statusLabels[event.status]}
									</span>
								</div>

								{#if event.tagline}
									<p>{event.tagline}</p>
								{:else if event.about}
									<p>{event.about}</p>
								{/if}
							</div>

							<div class="event-date">
								<span>DEADLINE</span>
								<strong>
									{formatDate(event.applicationCloseAt)}
								</strong>
							</div>

							<div class="arrow">↗</div>
						</a>
					{/each}
				</div>
			{/if}
		</section>

		<!-- GALLERY -->
		<section class="section gallery-section">
			<div class="section-header">
				<div>
					<p class="eyebrow">02 / GALLERY</p>
					<h2>Recent projects.</h2>
				</div>

				<a href="/projects" class="text-link">Explore gallery →</a>
			</div>

			{#if data.gallery.length === 0}
				<div class="empty">
					<p>No submitted projects yet.</p>
				</div>
			{:else}
				<div class="gallery-grid">
					{#each data.gallery as project}
						<a href={`/projects/${project.id}`} class="project-card">
							<div class="project-image">
								{#if project.thumbnail}
									<img
										src={project.thumbnail}
										alt={project.projectName}
									/>
								{:else}
									<span>NO IMAGE</span>
								{/if}
							</div>

							<div class="project-info">
								<p class="project-event">
									{project.eventName}
									{#if project.trackName}
										/ {project.trackName}
									{/if}
								</p>

								<h3>{project.projectName}</h3>

								{#if project.projectTagline}
									<p>{project.projectTagline}</p>
								{/if}
							</div>
						</a>
					{/each}
				</div>
			{/if}
		</section>

		<!-- PARTICIPANT -->
		{#if data.user?.role === 'participant'}
			<section class="role-section participant-section">
				<div>
					<p class="eyebrow">YOUR ACCOUNT</p>
					<h2>Keep building.</h2>
					<p>
						Register for events, form a team and submit
						your project before the deadline.
					</p>
				</div>

				<div class="role-actions">
					<a href="/activity" class="button primary">
						My activity →
					</a>

					<a href="/events" class="button">
						Find an event
					</a>
				</div>
			</section>
		{/if}

		<!-- ORGANIZER -->
		{#if data.user?.role === 'organizer' || data.user?.role === 'admin'}
			<section class="role-section organizer-section">
				<div>
					<p class="eyebrow">ORGANIZER</p>
					<h2>Run an event.</h2>
					<p>
						Create and manage your own hackathon,
						configure tracks and control submissions.
					</p>
				</div>

				<div class="role-actions">
					<a href="/events/new" class="button primary">
						Create event →
					</a>

					<a href="/events/manage" class="button">
						Manage events
					</a>
				</div>
			</section>
		{/if}

		<!-- JUDGE -->
		{#if data.user?.role === 'judge'}
			<section class="role-section judge-section">
				<div>
					<p class="eyebrow">JUDGE</p>
					<h2>Ready to judge.</h2>
					<p>
						Access your assigned projects and judging
						workspace.
					</p>
				</div>

				<div class="role-actions">
					<a href="/judging" class="button primary">
						Open judging →
					</a>
				</div>
			</section>
		{/if}

		<!-- ADMIN -->
		{#if data.user?.role === 'admin'}
			<section class="role-section admin-section">
				<div>
					<p class="eyebrow">ADMIN</p>
					<h2>System control.</h2>
					<p>
						Manage users and control the public platform.
					</p>
				</div>

				<div class="role-actions">
					<a href="/admin" class="button primary">
						Admin dashboard →
					</a>

					<a href="/admin/users" class="button">
						Users
					</a>

					<a href="/admin/gallery" class="button">
						Gallery
					</a>
				</div>
			</section>
		{/if}
	</main>

	<footer>
		<div>
			<strong>DOGFOOD</strong>
			<span>Hackathon infrastructure, without the hosted dependency.</span>
		</div>

		<div class="footer-links">
			<a href="/events">Events</a>
			<a href="/projects">Gallery</a>

			{#if data.user}
				<a href="/logout">Log out</a>
			{:else}
				<a href="/login">Log in</a>
				<a href="/signup">Sign up</a>
			{/if}
		</div>
	</footer>
</div>

<style>
	:global(html) {
		background: #f3f0e8;
	}

	:global(body) {
		margin: 0;
		background: #f3f0e8;
		color: #111;
		font-family:
			Arial,
			Helvetica,
			sans-serif;
	}

	:global(*) {
		box-sizing: border-box;
	}

	.site {
		min-height: 100vh;
		background: #f3f0e8;
	}

	main {
		max-width: 1500px;
		margin: 0 auto;
	}

	.hero {
		min-height: calc(100vh - 80px);
		padding: 5rem 2rem 4rem;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		border-bottom: 2px solid #111;
	}

	.hero-meta {
		display: flex;
		justify-content: space-between;
		gap: 2rem;
		font-size: 0.7rem;
		font-weight: 900;
		letter-spacing: 0.12em;
	}

	h1 {
		font-size: clamp(5rem, 15vw, 13rem);
		line-height: 0.78;
		letter-spacing: -0.07em;
		margin: 5rem 0;
		font-weight: 900;
	}

	.hero-bottom {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 3rem;
		align-items: end;
	}

	.hero-bottom p {
		max-width: 32rem;
		font-size: 1.2rem;
		line-height: 1.4;
		margin: 0;
	}

	.hero-actions,
	.role-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		justify-content: flex-end;
	}

	.button {
		display: inline-block;
		padding: 0.9rem 1.1rem;
		border: 2px solid #111;
		color: #111;
		background: transparent;
		text-decoration: none;
		font-weight: 900;
	}

	.button:hover {
		background: #111;
		color: #f3f0e8;
	}

	.button.primary {
		background: #111;
		color: #f3f0e8;
	}

	.button.primary:hover {
		background: transparent;
		color: #111;
	}

	.section {
		padding: 6rem 2rem;
		border-bottom: 2px solid #111;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: end;
		gap: 2rem;
		margin-bottom: 3rem;
	}

	.eyebrow {
		margin: 0 0 0.75rem;
		font-size: 0.7rem;
		font-weight: 900;
		letter-spacing: 0.12em;
	}

	h2 {
		font-size: clamp(3rem, 7vw, 7rem);
		line-height: 0.85;
		letter-spacing: -0.06em;
		margin: 0;
	}

	.text-link {
		color: inherit;
		font-weight: 900;
		text-decoration: none;
		border-bottom: 2px solid #111;
		padding-bottom: 0.2rem;
	}

	.event-list {
		border-top: 2px solid #111;
	}

	.event-row {
		display: grid;
		grid-template-columns: 70px 1fr 180px 30px;
		gap: 1.5rem;
		align-items: center;
		padding: 1.5rem 0;
		border-bottom: 2px solid #111;
		color: inherit;
		text-decoration: none;
	}

	.event-row:hover {
		background: #111;
		color: #f3f0e8;
		padding-left: 1rem;
		padding-right: 1rem;
	}

	.event-number {
		font-size: 0.8rem;
		font-weight: 900;
	}

	.event-title {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.event-title h3 {
		font-size: 2rem;
		margin: 0;
		letter-spacing: -0.04em;
	}

	.event-main p {
		margin: 0.4rem 0 0;
		max-width: 650px;
		opacity: 0.7;
	}

	.status {
		padding: 0.3rem 0.5rem;
		border: 1px solid currentColor;
		font-size: 0.65rem;
		font-weight: 900;
		text-transform: uppercase;
	}

	.event-date {
		display: grid;
		gap: 0.25rem;
		font-size: 0.75rem;
	}

	.event-date span {
		font-weight: 900;
		letter-spacing: 0.08em;
	}

	.event-date strong {
		font-size: 0.9rem;
	}

	.arrow {
		font-size: 1.5rem;
		font-weight: 900;
	}

	.empty {
		border: 2px solid #111;
		padding: 2rem;
	}

	.empty p {
		margin: 0 0 1rem;
	}

	.empty a {
		color: inherit;
		font-weight: 900;
	}

	.gallery-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1.5rem;
	}

	.project-card {
		color: inherit;
		text-decoration: none;
		border: 2px solid #111;
	}

	.project-card:hover {
		background: #111;
		color: #f3f0e8;
	}

	.project-image {
		aspect-ratio: 16 / 10;
		border-bottom: 2px solid #111;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #ddd9cf;
		font-size: 0.7rem;
		font-weight: 900;
	}

	.project-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.project-info {
		padding: 1.25rem;
	}

	.project-event {
		font-size: 0.65rem;
		font-weight: 900;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		margin: 0 0 1rem;
	}

	.project-info h3 {
		font-size: 1.8rem;
		line-height: 0.95;
		letter-spacing: -0.04em;
		margin: 0 0 0.75rem;
	}

	.project-info > p:last-child {
		margin: 0;
		opacity: 0.7;
		line-height: 1.4;
	}

	.role-section {
		padding: 5rem 2rem;
		border-bottom: 2px solid #111;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 3rem;
		align-items: end;
	}

	.role-section h2 {
		margin-bottom: 1.5rem;
	}

	.role-section > div:first-child > p:last-child {
		max-width: 35rem;
		font-size: 1.1rem;
		line-height: 1.5;
	}

	footer {
		max-width: 1500px;
		margin: 0 auto;
		padding: 3rem 2rem;
		display: flex;
		justify-content: space-between;
		gap: 2rem;
	}

	footer div:first-child {
		display: grid;
		gap: 0.5rem;
	}

	footer strong {
		font-size: 1.2rem;
	}

	footer span {
		opacity: 0.6;
		font-size: 0.85rem;
	}

	.footer-links {
		display: flex;
		gap: 1.5rem;
		flex-wrap: wrap;
	}

	.footer-links a {
		color: inherit;
		font-weight: 900;
		text-decoration: none;
	}

	@media (max-width: 800px) {
		.hero {
			padding-top: 3rem;
		}

		.hero-meta {
			flex-direction: column;
			gap: 0.5rem;
		}

		h1 {
			margin: 4rem 0;
			font-size: clamp(4rem, 18vw, 8rem);
		}

		.hero-bottom,
		.role-section {
			grid-template-columns: 1fr;
		}

		.hero-actions,
		.role-actions {
			justify-content: flex-start;
		}

		.section-header {
			align-items: flex-start;
			flex-direction: column;
		}

		.event-row {
			grid-template-columns: 40px 1fr 25px;
		}

		.event-date {
			display: none;
		}

		.gallery-grid {
			grid-template-columns: 1fr;
		}

		footer {
			flex-direction: column;
		}
	}
</style>