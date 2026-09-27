<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';

	let { data } = $props();

	const isAdmin = data.user?.role === 'admin';

	const statusLabels: Record<string, string> = {
		upcoming: 'Upcoming',
		open: 'Open',
		ongoing: 'Ongoing',
		completed: 'Completed',
		closed: 'Closed'
	};

	function formatDate(date: string | Date | null | undefined) {
		if (!date) return '—';

		return new Date(date).toLocaleDateString('en-IN', {
			day: '2-digit',
			month: 'short',
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Dogfood — Build. Submit. Get judged.</title>
	<meta
		name="description"
		content="Dogfood is an open-source, self-hostable platform for hackathons, projects and judging."
	/>
</svelte:head>

<Navbar />

<main>
	<!-- HERO -->
	<section class:admin-hero={isAdmin} class="hero">
		{#if isAdmin}
			<div class="hero-top">
				<div class="hero-meta">
					<span>01 / DOGFOOD 2026</span>
					<span>ADMINISTRATION</span>
				</div>

				<div class="hero-status">
					<span class="status-dot"></span>
					PLATFORM OVERVIEW
				</div>
			</div>

			<div class="hero-title-wrap">
				<p class="eyebrow">ADMINISTRATION</p>

				<h1 class="hero-title">
					Platform<br />
					<span>overview.</span>
				</h1>
			</div>

			<div class="hero-bottom">
				<p class="hero-description">
					Manage users, events, teams, projects and judging from one place.
				</p>

				<div class="hero-actions">
					<a href="#overview" class="button button-primary">
						View overview
						<span>↓</span>
					</a>

					<a href="/admin/users" class="button">
						User control
						<span>↗</span>
					</a>

					<a href="/events/manage" class="button">
						Manage events
						<span>↗</span>
					</a>
				</div>
			</div>
		{:else}
			<div class="hero-top">
				<div class="hero-meta">
					<span>01 / DOGFOOD 2026</span>
					<span>OPEN SOURCE / SELF-HOSTABLE</span>
				</div>

				<div class="hero-status">
					<span class="status-dot"></span>
					LOCAL-FIRST INFRASTRUCTURE
				</div>
			</div>

			<div class="hero-title-wrap">
				<h1 class="hero-title">
					Build.<br />
					<span>Submit.</span><br />
					Get judged.
				</h1>
			</div>

			<div class="hero-bottom">
				<p class="hero-description">
					A local-first platform for hackathons, projects, teams and judging.
					Open source. Self-hostable. Built for builders.
				</p>

				<div class="hero-actions">
					<a href="/events" class="button button-primary">
						Explore events
						<span>↗</span>
					</a>

					<a href="/projects" class="button">
						View projects
						<span>↗</span>
					</a>
				</div>
			</div>
		{/if}
	</section>

	<!-- MARQUEE -->
	<div class="marquee" aria-hidden="true">
		<div class="marquee-track">
			<span>BUILD</span>
			<span>•</span>
			<span>SUBMIT</span>
			<span>•</span>
			<span>JUDGE</span>
			<span>•</span>
			<span>SHIP</span>
			<span>•</span>

			<span>BUILD</span>
			<span>•</span>
			<span>SUBMIT</span>
			<span>•</span>
			<span>JUDGE</span>
			<span>•</span>
			<span>SHIP</span>
			<span>•</span>
		</div>
	</div>

	<!-- ADMIN OVERVIEW -->
	{#if isAdmin}
		<section id="overview" class="section stats-section">
			<div class="section-header">
				<div>
					<p class="section-index">01</p>
					<h2>Platform overview</h2>
				</div>

				<div class="section-side">
					<span>ADMIN</span>
					<span>LIVE DATA</span>
				</div>
			</div>

			<div class="stats-grid">
				<div class="stat-card">
					<span class="stat-label">USERS</span>
					<strong>{data.adminStats?.users ?? 0}</strong>
					<span class="stat-description">Registered accounts</span>
				</div>

				<div class="stat-card">
					<span class="stat-label">EVENTS</span>
					<strong>{data.adminStats?.events ?? 0}</strong>
					<span class="stat-description">Hackathons & events</span>
				</div>

				<div class="stat-card">
					<span class="stat-label">TEAMS</span>
					<strong>{data.adminStats?.teams ?? 0}</strong>
					<span class="stat-description">Registered teams</span>
				</div>

				<div class="stat-card">
					<span class="stat-label">PROJECTS</span>
					<strong>{data.adminStats?.projects ?? 0}</strong>
					<span class="stat-description">Submitted projects</span>
				</div>

				<div class="stat-card">
					<span class="stat-label">JUDGES</span>
					<strong>{data.adminStats?.judges ?? 0}</strong>
					<span class="stat-description">Judging accounts</span>
				</div>
			</div>
		</section>
	{/if}

	<!-- EVENTS -->
	<section class="section events-section">
		<div class="section-header">
			<div>
				<p class="section-index">{isAdmin ? '02' : '01'}</p>
				<h2>{isAdmin ? 'Manage events' : 'Events'}</h2>
			</div>

			<div class="section-side">
				<span>{isAdmin ? 'ADMIN' : 'DISCOVER'}</span>
				<span>{data.events?.length ?? 0} EVENTS</span>
			</div>
		</div>

		{#if isAdmin}
			{#if data.events?.length}
				<div class="admin-events">
					{#each data.events as event}
						<article class="admin-event-row">
							<div class="admin-event-main">
								<div class="event-number">
									{String(data.events.indexOf(event) + 1).padStart(2, '0')}
								</div>

								<div>
									<div class="event-topline">
										<span class="event-status">
											{statusLabels[event.status] ?? event.status}
										</span>

										{#if event.applicationOpenAt || event.applicationCloseAt}
											<span class="event-application">
												Applications:
												{formatDate(event.applicationOpenAt)}
												–
												{formatDate(event.applicationCloseAt)}
											</span>
										{/if}
									</div>

									<h3>{event.name}</h3>

									{#if event.tagline}
										<p>{event.tagline}</p>
									{:else if event.description}
										<p>{event.description}</p>
									{/if}
								</div>
							</div>

							<div class="admin-event-actions">
								<a href={`/events/${event.id}`} class="text-link">
									View
									<span>↗</span>
								</a>

								<a href={`/events/${event.id}/manage`} class="text-link">
									Manage
									<span>↗</span>
								</a>
							</div>
						</article>
					{/each}
				</div>
			{:else}
				<div class="empty">
					<p>No events have been created yet.</p>
				</div>
			{/if}

			<div class="create-event-row">
				<a href="/events/new" class="button button-primary">
					Create another event
					<span>+</span>
				</a>
			</div>
		{:else}
			{#if data.events?.length}
				<div class="event-list">
					{#each data.events as event}
						<a href={`/events/${event.id}`} class="event-row">
							<div class="event-date">
								<span>{formatDate(event.startAt ?? event.startsAt)}</span>

								{#if event.status}
									<span class="event-status">
										{statusLabels[event.status] ?? event.status}
									</span>
								{/if}
							</div>

							<div class="event-content">
								<h3 class="event-title">{event.name}</h3>

								{#if event.tagline}
									<p>{event.tagline}</p>
								{:else if event.description}
									<p>{event.description}</p>
								{:else if event.about}
									<p>{event.about}</p>
								{/if}
							</div>

							<div class="arrow">↗</div>
						</a>
					{/each}
				</div>
			{:else}
				<div class="empty">
					<p>No events available right now.</p>
				</div>
			{/if}
		{/if}
	</section>

	<!-- GALLERY -->
	<section class="section gallery-section">
		<div class="section-header">
			<div>
				<p class="section-index">{isAdmin ? '03' : '02'}</p>
				<h2>Projects</h2>
			</div>

			<div class="section-side">
				<span>GALLERY</span>
				<span>{data.gallery?.length ?? 0} PROJECTS</span>
			</div>
		</div>

		{#if data.gallery?.length}
			<div class="gallery-grid">
				{#each data.gallery as project}
					<a
						href={`/projects/${project.id}`}
						class="project-card"
					>
						<div class="project-image">
							{#if project.imageUrl || project.image}
								<img
									src={project.imageUrl ?? project.image}
									alt={project.name ?? project.title ?? 'Project'}
								/>
							{:else}
								<div class="project-placeholder">
									<span>NO IMAGE</span>
								</div>
							{/if}
						</div>

						<div class="project-info">
							<div>
								<h3>{project.name ?? project.title}</h3>

								{#if project.description}
									<p>{project.description}</p>
								{/if}
							</div>

							<div class="project-meta">
								{#if project.eventName || project.event?.name}
									<span>{project.eventName ?? project.event?.name}</span>
								{/if}

								{#if project.trackName || project.track?.name}
									<span>{project.trackName ?? project.track?.name}</span>
								{/if}
							</div>
						</div>
					</a>
				{/each}
			</div>
		{:else}
			<div class="empty">
				<p>No projects have been submitted yet.</p>
			</div>
		{/if}
	</section>

	<!-- PARTICIPANT -->
	{#if data.user?.role === 'participant'}
		<section class="section role-section">
			<div class="section-header">
				<div>
					<p class="section-index">{isAdmin ? '04' : '03'}</p>
					<h2>Participant</h2>
				</div>

				<div class="section-side">
					<span>YOUR SPACE</span>
				</div>
			</div>

			<div class="role-content">
				<div>
					<span class="role-label">PARTICIPANT</span>
					<h3>Build something worth judging.</h3>
					<p>
						Manage your teams, submissions and event participation from your
						dashboard.
					</p>
				</div>

				<a href="/dashboard" class="button button-primary">
					Open dashboard
					<span>↗</span>
				</a>
			</div>
		</section>
	{/if}

	<!-- ORGANIZER -->
	{#if data.user?.role === 'organizer'}
		<section class="section role-section">
			<div class="section-header">
				<div>
					<p class="section-index">{isAdmin ? '04' : '03'}</p>
					<h2>Organizer</h2>
				</div>

				<div class="section-side">
					<span>YOUR SPACE</span>
				</div>
			</div>

			<div class="role-content">
				<div>
					<span class="role-label">ORGANIZER</span>
					<h3>Run your event.</h3>
					<p>
						Create events, manage participants, review submissions and
						coordinate judging.
					</p>
				</div>

				<a href="/organizer" class="button button-primary">
					Open organizer dashboard
					<span>↗</span>
				</a>
			</div>
		</section>
	{/if}

	<!-- JUDGE -->
	{#if data.user?.role === 'judge'}
		<section class="section role-section">
			<div class="section-header">
				<div>
					<p class="section-index">{isAdmin ? '04' : '03'}</p>
					<h2>Judge</h2>
				</div>

				<div class="section-side">
					<span>YOUR SPACE</span>
				</div>
			</div>

			<div class="role-content">
				<div>
					<span class="role-label">JUDGE</span>
					<h3>Evaluate the work.</h3>
					<p>
						Review assigned projects and submit your evaluations through the
						judging dashboard.
					</p>
				</div>

				<a href="/judge" class="button button-primary">
					Open judging dashboard
					<span>↗</span>
				</a>
			</div>
		</section>
	{/if}

	<!-- ADMIN -->
	{#if isAdmin}
		<section class="section role-section admin-tools-section">
			<div class="section-header">
				<div>
					<p class="section-index">05</p>
					<h2>Administration</h2>
				</div>

				<div class="section-side">
					<span>CONTROL</span>
				</div>
			</div>

			<div class="admin-tools">
				<a href="/admin/users" class="admin-tool">
					<div>
						<span class="tool-number">01</span>
						<h3>Users</h3>
						<p>Manage registered accounts and roles.</p>
					</div>

					<span class="tool-arrow">↗</span>
				</a>

				<a href="/events/manage" class="admin-tool">
					<div>
						<span class="tool-number">02</span>
						<h3>Events</h3>
						<p>Create and manage platform events.</p>
					</div>

					<span class="tool-arrow">↗</span>
				</a>

				<a href="/projects" class="admin-tool">
					<div>
						<span class="tool-number">03</span>
						<h3>Projects</h3>
						<p>Review submitted projects and work.</p>
					</div>

					<span class="tool-arrow">↗</span>
				</a>
			</div>
		</section>
	{/if}
</main>

<footer class="footer">
	<div class="footer-top">
		<div class="footer-brand">
			<span class="footer-logo">DOGFOOD</span>

			<p>
				An open-source, self-hostable platform for hackathons,
				projects and judging.
			</p>
		</div>

		<div class="footer-links">
			<div>
				<span class="footer-heading">PLATFORM</span>
				<a href="/events">Events</a>
				<a href="/projects">Projects</a>
				{#if data.user}
					<a href="/dashboard">Dashboard</a>
				{/if}
			</div>

			<div>
				<span class="footer-heading">SYSTEM</span>
				<a href="/about">About</a>
				<a href="/privacy">Privacy</a>
				<a href="/terms">Terms</a>
			</div>
		</div>
	</div>

	<div class="footer-bottom">
		<span>© 2026 DOGFOOD</span>
		<span>OPEN SOURCE / SELF-HOSTED</span>
	</div>
</footer>

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
		font-family:
			Arial,
			Helvetica,
			sans-serif;
	}

	:global(a) {
		color: inherit;
		text-decoration: none;
	}

	.hero {
		min-height: 720px;
		padding: 40px 5vw 48px;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		border-bottom: 2px solid #111;
		background: #f4f0e8;
	}

	.hero.admin-hero {
		background: #111;
		color: #f4f0e8;
	}

	.hero-top {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 32px;
	}

	.hero-meta {
		display: flex;
		flex-direction: column;
		gap: 5px;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.08em;
	}

	.hero-status {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.08em;
	}

	.status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #111;
		display: inline-block;
	}

	.admin-hero .status-dot {
		background: #f4f0e8;
	}

	.hero-title-wrap {
		margin: auto 0;
		padding: 70px 0;
	}

	.eyebrow {
		margin: 0 0 24px;
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.12em;
	}

	.hero-title {
		margin: 0;
		font-size: clamp(72px, 13vw, 190px);
		line-height: 0.83;
		font-weight: 900;
		letter-spacing: -0.075em;
		text-transform: uppercase;
	}

	.hero-title span {
		font-style: italic;
	}

	.hero-bottom {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 48px;
	}

	.hero-description {
		max-width: 500px;
		margin: 0;
		font-size: 17px;
		line-height: 1.4;
	}

	.hero-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		justify-content: flex-end;
	}

	.button {
		min-height: 48px;
		padding: 0 18px;
		display: inline-flex;
		align-items: center;
		justify-content: space-between;
		gap: 28px;
		border: 1px solid #111;
		font-size: 12px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		transition:
			background 0.15s ease,
			color 0.15s ease;
	}

	.button:hover {
		background: #111;
		color: #f4f0e8;
	}

	.button-primary {
		background: #111;
		color: #f4f0e8;
	}

	.button-primary:hover {
		background: transparent;
		color: #111;
	}

	.admin-hero .button {
		border-color: #f4f0e8;
	}

	.admin-hero .button:hover {
		background: #f4f0e8;
		color: #111;
	}

	.admin-hero .button-primary {
		background: #f4f0e8;
		color: #111;
	}

	.admin-hero .button-primary:hover {
		background: transparent;
		color: #f4f0e8;
	}

	.marquee {
		overflow: hidden;
		border-bottom: 2px solid #111;
		background: #111;
		color: #f4f0e8;
	}

	.marquee-track {
		width: max-content;
		padding: 14px 0;
		display: flex;
		gap: 30px;
		font-size: 14px;
		font-weight: 800;
		letter-spacing: 0.08em;
		animation: marquee 24s linear infinite;
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
		padding: 100px 5vw;
		border-bottom: 2px solid #111;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 40px;
		margin-bottom: 60px;
	}

	.section-index {
		margin: 0 0 10px;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.08em;
	}

	.section h2 {
		margin: 0;
		font-size: clamp(42px, 6vw, 86px);
		line-height: 0.9;
		letter-spacing: -0.06em;
		text-transform: uppercase;
	}

	.section-side {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 5px;
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.08em;
	}

	/* ADMIN STATS */

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		border-top: 1px solid #111;
		border-left: 1px solid #111;
	}

	.stat-card {
		min-height: 220px;
		padding: 24px;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		border-right: 1px solid #111;
		border-bottom: 1px solid #111;
	}

	.stat-label {
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.1em;
	}

	.stat-card strong {
		font-size: clamp(52px, 6vw, 88px);
		line-height: 0.9;
		letter-spacing: -0.07em;
	}

	.stat-description {
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	/* NORMAL EVENTS */

	.event-list {
		border-top: 2px solid #111;
	}

	.event-row {
		min-height: 170px;
		display: grid;
		grid-template-columns: 180px 1fr 60px;
		align-items: center;
		gap: 40px;
		border-bottom: 1px solid #111;
		transition: padding 0.2s ease;
	}

	.event-row:hover {
		padding-left: 20px;
	}

	.event-date {
		display: flex;
		flex-direction: column;
		gap: 8px;
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
	}

	.event-status {
		display: inline-block;
		width: fit-content;
		padding: 5px 7px;
		border: 1px solid #111;
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	.event-content h3 {
		margin: 0 0 10px;
		font-size: clamp(28px, 4vw, 54px);
		line-height: 0.95;
		letter-spacing: -0.05em;
		text-transform: uppercase;
	}

	.event-content p {
		max-width: 650px;
		margin: 0;
		font-size: 14px;
		line-height: 1.5;
	}

	.arrow {
		font-size: 28px;
		text-align: right;
	}

	/* ADMIN EVENTS */

	.admin-events {
		border-top: 2px solid #111;
	}

	.admin-event-row {
		min-height: 190px;
		padding: 30px 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 40px;
		border-bottom: 1px solid #111;
	}

	.admin-event-main {
		display: grid;
		grid-template-columns: 70px 1fr;
		gap: 30px;
		align-items: start;
	}

	.event-number {
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.08em;
	}

	.event-topline {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 10px;
		margin-bottom: 15px;
	}

	.event-application {
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.admin-event-row h3 {
		margin: 0 0 10px;
		font-size: clamp(28px, 4vw, 54px);
		line-height: 0.95;
		letter-spacing: -0.05em;
		text-transform: uppercase;
	}

	.admin-event-row p {
		max-width: 700px;
		margin: 0;
		font-size: 14px;
		line-height: 1.5;
	}

	.admin-event-actions {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 15px;
		flex-shrink: 0;
	}

	.text-link {
		display: inline-flex;
		gap: 10px;
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.text-link:hover {
		text-decoration: underline;
	}

	.create-event-row {
		padding-top: 30px;
	}

	/* GALLERY */

	.gallery-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 20px;
	}

	.project-card {
		border: 1px solid #111;
		background: #f4f0e8;
		transition:
			transform 0.2s ease,
			background 0.2s ease;
	}

	.project-card:hover {
		transform: translateY(-5px);
		background: #fff;
	}

	.project-image {
		position: relative;
		width: 100%;
		aspect-ratio: 4 / 3;
		overflow: hidden;
		border-bottom: 1px solid #111;
		background: #ddd8ce;
	}

	.project-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.project-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.08em;
	}

	.project-info {
		min-height: 180px;
		padding: 20px;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 30px;
	}

	.project-info h3 {
		margin: 0 0 8px;
		font-size: 24px;
		line-height: 1;
		letter-spacing: -0.04em;
		text-transform: uppercase;
	}

	.project-info p {
		margin: 0;
		font-size: 13px;
		line-height: 1.45;
	}

	.project-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.project-meta span {
		padding: 5px 7px;
		border: 1px solid #111;
		font-size: 9px;
		font-weight: 700;
		text-transform: uppercase;
	}

	/* EMPTY */

	.empty {
		padding: 70px 20px;
		border-top: 2px solid #111;
		border-bottom: 1px solid #111;
	}

	.empty p {
		margin: 0;
		font-size: 14px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	/* ROLE SECTIONS */

	.role-content {
		padding: 40px;
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 50px;
		border: 1px solid #111;
	}

	.role-label {
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.1em;
	}

	.role-content h3 {
		max-width: 800px;
		margin: 15px 0 12px;
		font-size: clamp(32px, 5vw, 70px);
		line-height: 0.9;
		letter-spacing: -0.06em;
		text-transform: uppercase;
	}

	.role-content p {
		max-width: 600px;
		margin: 0;
		font-size: 14px;
		line-height: 1.5;
	}

	/* ADMIN TOOLS */

	.admin-tools {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		border-top: 1px solid #111;
		border-left: 1px solid #111;
	}

	.admin-tool {
		min-height: 250px;
		padding: 25px;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		border-right: 1px solid #111;
		border-bottom: 1px solid #111;
		transition:
			background 0.15s ease,
			color 0.15s ease;
	}

	.admin-tool:hover {
		background: #111;
		color: #f4f0e8;
	}

	.tool-number {
		font-size: 10px;
		font-weight: 700;
	}

	.admin-tool h3 {
		margin: 35px 0 8px;
		font-size: 34px;
		line-height: 0.9;
		letter-spacing: -0.05em;
		text-transform: uppercase;
	}

	.admin-tool p {
		margin: 0;
		font-size: 12px;
		line-height: 1.4;
	}

	.tool-arrow {
		align-self: flex-end;
		font-size: 25px;
	}

	/* FOOTER */

	.footer {
		padding: 70px 5vw 25px;
		background: #111;
		color: #f4f0e8;
	}

	.footer-top {
		display: flex;
		justify-content: space-between;
		gap: 80px;
		padding-bottom: 80px;
	}

	.footer-brand {
		max-width: 420px;
	}

	.footer-logo {
		display: block;
		margin-bottom: 25px;
		font-size: clamp(48px, 7vw, 100px);
		font-weight: 900;
		line-height: 0.8;
		letter-spacing: -0.07em;
	}

	.footer-brand p {
		margin: 0;
		font-size: 14px;
		line-height: 1.5;
	}

	.footer-links {
		display: flex;
		gap: 100px;
	}

	.footer-links > div {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 9px;
	}

	.footer-heading {
		margin-bottom: 10px;
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.1em;
	}

	.footer-links a {
		font-size: 12px;
	}

	.footer-links a:hover {
		text-decoration: underline;
	}

	.footer-bottom {
		padding-top: 20px;
		display: flex;
		justify-content: space-between;
		gap: 20px;
		border-top: 1px solid #555;
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.08em;
	}

	@media (max-width: 900px) {
		.hero {
			min-height: 650px;
		}

		.hero-bottom {
			align-items: flex-start;
			flex-direction: column;
		}

		.hero-actions {
			justify-content: flex-start;
		}

		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.gallery-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.admin-tools {
			grid-template-columns: 1fr;
		}

		.footer-top {
			flex-direction: column;
		}
	}

	@media (max-width: 650px) {
		.hero {
			min-height: 600px;
			padding: 25px 20px 30px;
		}

		.hero-top {
			flex-direction: column;
			gap: 20px;
		}

		.hero-status {
			align-self: flex-start;
		}

		.hero-title-wrap {
			padding: 60px 0;
		}

		.hero-title {
			font-size: clamp(60px, 18vw, 110px);
		}

		.section {
			padding: 70px 20px;
		}

		.section-header {
			flex-direction: column;
			margin-bottom: 40px;
		}

		.section-side {
			align-items: flex-start;
		}

		.section h2 {
			font-size: 48px;
		}

		.stats-grid {
			grid-template-columns: 1fr 1fr;
		}

		.stat-card {
			min-height: 170px;
			padding: 18px;
		}

		.stat-card strong {
			font-size: 52px;
		}

		.event-row {
			grid-template-columns: 1fr 30px;
			gap: 20px;
			padding: 30px 0;
		}

		.event-date {
			grid-column: 1 / -1;
		}

		.event-content h3 {
			font-size: 32px;
		}

		.admin-event-row {
			flex-direction: column;
			align-items: flex-start;
			gap: 25px;
		}

		.admin-event-main {
			grid-template-columns: 40px 1fr;
			gap: 15px;
		}

		.admin-event-actions {
			flex-direction: row;
			align-items: flex-start;
		}

		.gallery-grid {
			grid-template-columns: 1fr;
		}

		.role-content {
			padding: 25px;
			align-items: flex-start;
			flex-direction: column;
		}

		.footer {
			padding: 55px 20px 20px;
		}

		.footer-top {
			padding-bottom: 60px;
		}

		.footer-links {
			gap: 50px;
		}

		.footer-bottom {
			flex-direction: column;
		}
	}
</style>

