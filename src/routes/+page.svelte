
<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';

	let { data } = $props();

	const isAdmin = data.user?.role === 'admin';

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
		<section class:admin-hero={isAdmin} class="hero">
			<div class="hero-grid"></div>

			{#if isAdmin}

				<div class="hero-bottom">
					<p class="hero-kicker">ADMINISTRATION</p>

					<div class="hero-actions">
						<a href="#overview" class="button">
							Platform overview
						</a>

						<a href="/admin/users" class="button">
							User control 
						</a>

						<a href="/admin/users" class="button">
							Manage Events
						</a>
					</div>
				</div>
			{:else}
				<div class="hero-title-wrap">
					<p class="hero-kicker">OPEN SOURCE HACKATHON PLATFORM</p>
					<h1>
						Build.<br />
						Submit.<br />
						<span>Get judged.</span>
					</h1>
				</div>

				<div class="hero-bottom">
					<p>
						A self-hostable platform for running, submitting and judging
						hackathons.
					</p>

					<div class="hero-actions">
						<a href="#events" class="button primary">
							Explore events <span>↓</span>
						</a>

						<a href="/signup" class="button">
							Get started <span>↗</span>
						</a>
					</div>
				</div>
			{/if}
		</section>

		<!-- MARQUEE -->
		<div class="marquee">
			<div class="marquee-track">
				<span>DOGFOOD</span>
				<span>OPEN SOURCE</span>
				<span>SELF-HOSTED</span>
				<span>HACKATHONS</span>
				<span>JUDGING</span>
				<span>DOGFOOD</span>
				<span>OPEN SOURCE</span>
				<span>SELF-HOSTED</span>
				<span>HACKATHONS</span>
				<span>JUDGING</span>
			</div>
		</div>

		{#if isAdmin}
			<!-- ADMIN OVERVIEW -->
			<section id="overview" class="section stats-section">
				<div class="section-heading">
					<div>
						<p class="eyebrow">01 / SYSTEM OVERVIEW</p>
						<h2>Platform<br />at a glance.</h2>
					</div>

					<a href="/admin/users" class="button">
						User control <span>↗</span>
					</a>
				</div>

				<div class="stats-grid">
					<div class="stat-card">
						<span class="stat-label">Users</span>
						<strong>{data.adminStats?.users ?? 0}</strong>
					</div>

					<div class="stat-card">
						<span class="stat-label">Events</span>
						<strong>{data.adminStats?.events ?? 0}</strong>
					</div>

					<div class="stat-card">
						<span class="stat-label">Teams</span>
						<strong>{data.adminStats?.teams ?? 0}</strong>
					</div>

					<div class="stat-card">
						<span class="stat-label">Projects</span>
						<strong>{data.adminStats?.projects ?? 0}</strong>
					</div>

					<div class="stat-card">
						<span class="stat-label">Judges</span>
						<strong>{data.adminStats?.judges ?? 0}</strong>
					</div>
				</div>
			</section>

			<!-- ADMIN EVENTS -->
			<section id="events" class="section events-section admin-events-section">
				<div class="section-heading">
					<div>
						<p class="eyebrow">02 / CURRENT EVENTS</p>
						<h2>Manage<br />your events.</h2>
					</div>

					<a href="/events/new" class="button primary">
						Create event <span>↗</span>
					</a>
				</div>

				{#if data.events.length === 0}
					<div class="empty-state">
						<p>No events have been created yet.</p>

						<a href="/events/new" class="text-link">
							Create your first event <span>↗</span>
						</a>
					</div>
				{:else}
					<div class="event-list">
						{#each data.events as event, index}
							<article class="event-card">
								<div class="event-index">
									{String(index + 1).padStart(2, '0')}
								</div>

								<div class="event-main">
									<div class="event-topline">
										<span class="status status-{event.status}">
											{statusLabels[event.status]}
										</span>

										<span class="event-date">
											{formatDate(event.applicationOpenAt)}
											—
											{formatDate(event.applicationCloseAt)}
										</span>
									</div>

									<h3>{event.name}</h3>

									{#if event.tagline}
										<p>{event.tagline}</p>
									{/if}
								</div>

								<div class="event-actions">
									<a href={`/events/${event.id}`} class="text-link">
										View <span>↗</span>
									</a>

									<a href={`/events/${event.id}/manage`} class="text-link">
										Manage event
									</a>
								</div>
							</article>
						{/each}
					</div>

					<div class="events-create-row">
						<a href="/events/new" class="create-event-link">
							<span>+</span>
							Create another event
							<strong>↗</strong>
						</a>
					</div>
				{/if}
			</section>
		{:else}
			<!-- NORMAL EVENTS -->
			<section id="events" class="section events-section">
				<div class="section-heading">
					<div>
						<p class="eyebrow">01 / EVENTS</p>
						<h2>Find your<br />next challenge.</h2>
					</div>
				</div>

				{#if data.events.length === 0}
					<div class="empty-state">
						<p>No events are available right now.</p>
					</div>
				{:else}
					<div class="event-list">
						{#each data.events as event, index}
							<article class="event-card">
								<div class="event-index">
									{String(index + 1).padStart(2, '0')}
								</div>

								<div class="event-main">
									<div class="event-topline">
										<span class="status status-{event.status}">
											{statusLabels[event.status]}
										</span>

										<span class="event-date">
											{formatDate(event.applicationOpenAt)}
											—
											{formatDate(event.applicationCloseAt)}
										</span>
									</div>

									<h3>{event.name}</h3>

									{#if event.tagline}
										<p>{event.tagline}</p>
									{/if}
								</div>

								<div class="event-actions">
									<a href={`/events/${event.id}`} class="text-link">
										View <span>↗</span>
									</a>
								</div>
							</article>
						{/each}
					</div>
				{/if}
			</section>
		{/if}

		<!-- GALLERY -->
		<section class="section gallery-section">
			<div class="section-heading">
				<div>
					<p class="eyebrow">{isAdmin ? '03' : '02'} / GALLERY</p>
					<h2>See what<br />people built.</h2>
				</div>

				<a href="/projects" class="button">
					View gallery <span>↗</span>
				</a>
			</div>

			{#if data.gallery.length === 0}
				<div class="empty-state">
					<p>No submitted projects yet.</p>
				</div>
			{:else}
				<div class="gallery-grid">
					{#each data.gallery as project}
						<a href={`/projects/${project.id}`} class="gallery-card">
							<div class="gallery-image">
								{#if project.thumbnail}
									<img
										src={project.thumbnail}
										alt={project.projectName}
									/>
								{:else}
									<div class="gallery-placeholder">
										<span>NO IMAGE</span>
									</div>
								{/if}
							</div>

							<div class="gallery-info">
								<div>
									<h3>{project.projectName}</h3>

									{#if project.projectTagline}
										<p>{project.projectTagline}</p>
									{/if}
								</div>

								<span class="gallery-arrow">↗</span>
							</div>

							<div class="gallery-meta">
								<span>{project.eventName}</span>
								<span>{project.trackName}</span>
							</div>
						</a>
					{/each}
				</div>
			{/if}
		</section>

		<!-- PARTICIPANT -->
		{#if data.user?.role === 'participant'}
			<section class="role-section">
				<div class="role-number">{isAdmin ? '04' : '03'}</div>

				<div class="role-content">
					<p class="eyebrow">PARTICIPANT</p>
					<h2>Build<br />something.</h2>

					<p class="role-description">
						Join a team, submit your project and follow your progress
						through the hackathon.
					</p>
				</div>

				<div class="role-actions">
					<a href="/activity" class="button primary">
						My activity <span>↗</span>
					</a>

					<a href="/projects" class="button">
						Projects
					</a>
				</div>
			</section>
		{/if}

		<!-- ORGANIZER -->
		{#if data.user?.role === 'organizer'}
			<section class="role-section">
				<div class="role-number">{isAdmin ? '04' : '03'}</div>

				<div class="role-content">
					<p class="eyebrow">ORGANIZER</p>
					<h2>Run<br />your event.</h2>

					<p class="role-description">
						Create events, configure participation and manage your
						hackathon from one place.
					</p>
				</div>

				<div class="role-actions">
					<a href="/events/new" class="button primary">
						Create event <span>↗</span>
					</a>

					<a href="/events/manage" class="button">
						Manage events
					</a>
				</div>
			</section>
		{/if}

		<!-- JUDGE -->
		{#if data.user?.role === 'judge'}
			<section class="role-section">
				<div class="role-number">{isAdmin ? '04' : '03'}</div>

				<div class="role-content">
					<p class="eyebrow">JUDGE</p>
					<h2>Review.<br />Score.</h2>

					<p class="role-description">
						Review assigned projects and submit your scores through the
						judging workflow.
					</p>
				</div>

				<div class="role-actions">
					<a href="/judging" class="button primary">
						Open judging <span>↗</span>
					</a>
				</div>
			</section>
		{/if}
	</main>

	<footer class="footer">
		<div class="footer-top">
			<div>
				<p class="eyebrow">DOGFOOD</p>
				<p class="footer-description">
					Open source. Self-hostable. Built for hackathons.
				</p>
			</div>

			<div class="footer-links">
				<a href="/projects">Gallery</a>
				<a href="/events">Events</a>

				{#if data.user?.role === 'admin'}
					<a href="/admin/users">Users</a>
				{/if}
			</div>
		</div>

		<div class="footer-bottom">
			<span>© 2026 DOGFOOD</span>
			<span>OPEN SOURCE HACKATHON PLATFORM</span>
		</div>
	</footer>
</div>

<style>
	:global(*) {
		box-sizing: border-box;
	}

	:global(html) {
		scroll-behavior: smooth;
	}

	:global(body) {
		margin: 0;
		background: #f4f0e8;
		color: #111;
		font-family: Arial, Helvetica, sans-serif;
	}

	:global(a) {
		color: inherit;
		text-decoration: none;
	}

	.site {
		min-height: 100vh;
		overflow: hidden;
	}

	main {
		display: block;
	}

	.hero {
		position: relative;
		min-height: calc(100vh - 80px);
		padding: 7rem 6vw 4rem;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		background: #f4f0e8;
		border-bottom: 1px solid #111;
	}

	.hero.admin-hero {
		min-height: 620px;
	}

	.hero-grid {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background-image:
			linear-gradient(to right, rgba(17, 17, 17, 0.06) 1px, transparent 1px),
			linear-gradient(to bottom, rgba(17, 17, 17, 0.06) 1px, transparent 1px);
		background-size: 80px 80px;
	}

	.hero-title-wrap,
	.hero-bottom {
		position: relative;
		z-index: 1;
	}

	.hero-kicker,
	.eyebrow {
		margin: 0 0 1.5rem;
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.hero h1 {
		max-width: 1100px;
		margin: 0;
		font-size: clamp(5rem, 12vw, 11rem);
		line-height: 0.8;
		font-weight: 800;
		letter-spacing: -0.07em;
	}

	.hero h1 span {
		font-style: italic;
	}

	.hero-bottom {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 2rem;
		margin-top: 6rem;
	}

	.hero-bottom p {
		max-width: 420px;
		margin: 0;
		font-size: 1rem;
		line-height: 1.5;
	}

	.hero-actions {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 1.25rem;
		min-height: 48px;
		padding: 0.75rem 1.1rem;
		border: 1px solid #111;
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		transition: background 0.2s ease, color 0.2s ease;
	}

	.button:hover {
		background: #111;
		color: #f4f0e8;
	}

	.button.primary {
		background: #111;
		color: #f4f0e8;
	}

	.button.primary:hover {
		background: transparent;
		color: #111;
	}

	.marquee {
		overflow: hidden;
		border-bottom: 1px solid #111;
		background: #111;
		color: #f4f0e8;
	}

	.marquee-track {
		display: flex;
		width: max-content;
		animation: marquee 25s linear infinite;
	}

	.marquee span {
		padding: 0.85rem 2rem;
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		white-space: nowrap;
	}

	@keyframes marquee {
		from {
			transform: translateX(0);
		}

		to {
			transform: translateX(-50%);
		}
	}

	.section {
		padding: 7rem 6vw;
		border-bottom: 1px solid #111;
	}

	.section-heading {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 2rem;
		margin-bottom: 4rem;
	}

	.section-heading h2 {
		margin: 0;
		font-size: clamp(3rem, 7vw, 7rem);
		line-height: 0.85;
		letter-spacing: -0.06em;
		font-weight: 800;
	}

	.stats-section {
		background: #111;
		color: #f4f0e8;
	}

	.stats-section .button {
		border-color: #f4f0e8;
	}

	.stats-section .button:hover {
		background: #f4f0e8;
		color: #111;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		border-top: 1px solid rgba(244, 240, 232, 0.4);
		border-left: 1px solid rgba(244, 240, 232, 0.4);
	}

	.stat-card {
		min-height: 190px;
		padding: 1.5rem;
		border-right: 1px solid rgba(244, 240, 232, 0.4);
		border-bottom: 1px solid rgba(244, 240, 232, 0.4);
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.stat-label {
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		opacity: 0.65;
	}

	.stat-card strong {
		font-size: clamp(3rem, 5vw, 5rem);
		line-height: 0.85;
		letter-spacing: -0.06em;
	}

	.event-list {
		border-top: 1px solid #111;
	}

	.event-card {
		display: grid;
		grid-template-columns: 80px 1fr auto;
		gap: 2rem;
		align-items: center;
		padding: 2rem 0;
		border-bottom: 1px solid #111;
	}

	.event-index {
		font-size: 0.75rem;
		font-weight: 700;
	}

	.event-main h3 {
		margin: 0.75rem 0 0.35rem;
		font-size: clamp(1.8rem, 3vw, 3rem);
		line-height: 0.95;
		letter-spacing: -0.04em;
	}

	.event-main p {
		margin: 0;
		max-width: 600px;
		color: #555;
		line-height: 1.5;
	}

	.event-topline {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.status {
		display: inline-block;
		padding: 0.35rem 0.55rem;
		border: 1px solid #111;
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.status-upcoming {
		background: #ddd7c9;
	}

	.status-active {
		background: #111;
		color: #f4f0e8;
	}

	.status-ended {
		opacity: 0.55;
	}

	.event-date {
		font-size: 0.7rem;
		color: #555;
	}

	.event-actions {
		display: flex;
		gap: 1.25rem;
		align-items: center;
	}

	.text-link {
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.text-link span {
		margin-left: 0.4rem;
	}

	.text-link:hover {
		text-decoration: underline;
	}

	.events-create-row {
		padding-top: 2rem;
	}

	.create-event-link {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.5rem 0;
		border-bottom: 1px solid #111;
		font-size: 1rem;
		font-weight: 700;
	}

	.create-event-link span {
		font-size: 2rem;
		font-weight: 400;
	}

	.create-event-link strong {
		font-size: 1rem;
	}

	.empty-state {
		padding: 4rem 0;
		border-top: 1px solid #111;
		border-bottom: 1px solid #111;
	}

	.empty-state p {
		margin: 0 0 1.5rem;
		color: #555;
	}

	.gallery-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1px;
		background: #111;
		border: 1px solid #111;
	}

	.gallery-card {
		background: #f4f0e8;
		padding-bottom: 1.25rem;
	}

	.gallery-image {
		aspect-ratio: 4 / 3;
		overflow: hidden;
		background: #ddd7c9;
		border-bottom: 1px solid #111;
	}

	.gallery-image img {
		width: 100%;
		height: 100%;
		display: block;
		object-fit: cover;
	}

	.gallery-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.1em;
	}

	.gallery-info {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		padding: 1.25rem 1.25rem 0;
	}

	.gallery-info h3 {
		margin: 0;
		font-size: 1.3rem;
		letter-spacing: -0.03em;
	}

	.gallery-info p {
		margin: 0.35rem 0 0;
		color: #555;
		font-size: 0.85rem;
		line-height: 1.4;
	}

	.gallery-arrow {
		font-size: 1.1rem;
	}

	.gallery-meta {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem 1.25rem 0;
		color: #666;
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	.role-section {
		display: grid;
		grid-template-columns: 80px 1fr auto;
		gap: 2rem;
		align-items: center;
		padding: 7rem 6vw;
		border-bottom: 1px solid #111;
	}

	.role-number {
		font-size: 0.75rem;
		font-weight: 700;
		align-self: start;
	}

	.role-content h2 {
		margin: 0;
		font-size: clamp(3.5rem, 7vw, 7rem);
		line-height: 0.82;
		letter-spacing: -0.06em;
	}

	.role-description {
		max-width: 520px;
		margin: 2rem 0 0;
		color: #555;
		line-height: 1.5;
	}

	.role-actions {
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
		min-width: 180px;
	}

	.footer {
		padding: 4rem 6vw 2rem;
		background: #111;
		color: #f4f0e8;
	}

	.footer-top {
		display: flex;
		justify-content: space-between;
		gap: 3rem;
		padding-bottom: 5rem;
	}

	.footer-description {
		max-width: 350px;
		margin: 0;
		line-height: 1.5;
		opacity: 0.7;
	}

	.footer-links {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
	}

	.footer-links a:hover {
		text-decoration: underline;
	}

	.footer-bottom {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		padding-top: 1.5rem;
		border-top: 1px solid rgba(244, 240, 232, 0.25);
		font-size: 0.65rem;
		letter-spacing: 0.08em;
		opacity: 0.6;
	}

	@media (max-width: 900px) {
		.hero {
			min-height: 700px;
			padding: 5rem 5vw 3rem;
		}

		.hero h1 {
			font-size: clamp(4rem, 15vw, 8rem);
		}

		.hero-bottom {
			align-items: flex-start;
			flex-direction: column;
		}

		.section,
		.role-section {
			padding: 5rem 5vw;
		}

		.section-heading {
			align-items: flex-start;
			flex-direction: column;
		}

		.event-card {
			grid-template-columns: 50px 1fr;
		}

		.event-actions {
			grid-column: 2;
		}

		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.gallery-grid {
			grid-template-columns: 1fr;
		}

		.role-section {
			grid-template-columns: 50px 1fr;
		}

		.role-actions {
			grid-column: 2;
			flex-direction: row;
			flex-wrap: wrap;
		}
	}

	@media (max-width: 600px) {
		.hero {
			min-height: 650px;
		}

		.hero h1 {
			font-size: clamp(3.5rem, 18vw, 6rem);
		}

		.stats-grid {
			grid-template-columns: 1fr;
		}

		.stat-card {
			min-height: 150px;
		}

		.event-card {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.event-actions {
			grid-column: auto;
		}

		.role-section {
			grid-template-columns: 1fr;
		}

		.role-number {
			margin-bottom: -0.5rem;
		}

		.role-actions {
			grid-column: auto;
			min-width: 0;
		}

		.footer-top,
		.footer-bottom {
			flex-direction: column;
		}
	}
</style>

