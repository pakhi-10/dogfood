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
			<div class="hero-top">
				<div class="hero-meta">
					<span>01 / DOGFOOD 2026</span>
					<span>OPEN SOURCE / SELF-HOSTABLE</span>
				</div>

				<div class="hero-status">
					<span class="status-dot"></span>
					LOCAL-FIRST HACKATHON INFRASTRUCTURE
				</div>
			</div>

			<div class="hero-title-wrap">
				<p class="hero-kicker">THE PLATFORM FOR</p>

				<h1>
					Build.<br />
					Submit.<br />
					<span>Get judged.</span>
				</h1>
			</div>

			<div class="hero-bottom">
				<p>
					A complete platform for running hackathons,
					forming teams, submitting projects and judging
					real work.
				</p>

				<div class="hero-actions">
					<a href="/events" class="button primary">
						Explore events <span>↗</span>
					</a>

					<a href="/projects" class="button">
						Public gallery <span>→</span>
					</a>
				</div>
			</div>
		</section>

		<!-- MARQUEE -->
		<div class="marquee" aria-hidden="true">
			<div class="marquee-track">
				<span>BUILD</span>
				<i>✦</i>
				<span>SUBMIT</span>
				<i>✦</i>
				<span>JUDGE</span>
				<i>✦</i>
				<span>SHIP</span>
				<i>✦</i>
				<span>BUILD</span>
				<i>✦</i>
				<span>SUBMIT</span>
				<i>✦</i>
				<span>JUDGE</span>
				<i>✦</i>
				<span>SHIP</span>
				<i>✦</i>
			</div>
		</div>

		<!-- EVENTS -->
		<section class="section events-section">
			<div class="section-header">
				<div>
					<p class="eyebrow">02 / EVENTS</p>
					<h2>Current<br />events.</h2>
				</div>

				<div class="section-side">
					<p>
						Find an event, build something useful and
						put it in front of judges.
					</p>

					<a href="/events" class="text-link">
						View all events →
					</a>
				</div>
			</div>

			{#if data.events.length === 0}
				<div class="empty">
					<div>
						<span class="empty-number">—</span>
						<p>No events have been created yet.</p>
					</div>

					{#if data.user?.role === 'organizer' || data.user?.role === 'admin'}
						<a href="/events/new">
							Create an event →
						</a>
					{/if}
				</div>
			{:else}
				<div class="event-list">
					{#each data.events as event, index}
						<a href={`/events/${event.id}`} class="event-row">
							<div class="event-number">
								{String(index + 1).padStart(2, '0')}
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
					<p class="eyebrow">03 / GALLERY</p>
					<h2>Recent<br />projects.</h2>
				</div>

				<div class="section-side">
					<p>
						Explore projects that have already made it
						through the submission process.
					</p>

					<a href="/projects" class="text-link">
						Explore gallery →
					</a>
				</div>
			</div>

			{#if data.gallery.length === 0}
				<div class="empty">
					<div>
						<span class="empty-number">—</span>
						<p>No submitted projects yet.</p>
					</div>
				</div>
			{:else}
				<div class="gallery-grid">
					{#each data.gallery as project, index}
						<a
							href={`/projects/${project.id}`}
							class="project-card"
						>
							<div class="project-image">
								<div class="project-index">
									{String(index + 1).padStart(2, '0')}
								</div>

								{#if project.thumbnail}
									<img
										src={project.thumbnail}
										alt={project.projectName}
									/>
								{:else}
									<span>NO IMAGE</span>
								{/if}

								<div class="image-arrow">↗</div>
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
				<div class="role-number">04</div>

				<div class="role-content">
					<p class="eyebrow">YOUR ACCOUNT</p>
					<h2>Keep<br />building.</h2>
					<p class="role-description">
						Register for events, form a team and submit
						your project before the deadline.
					</p>
				</div>

				<div class="role-actions">
					<a href="/activity" class="button primary">
						My activity <span>↗</span>
					</a>

					<a href="/events" class="button">
						Find an event <span>→</span>
					</a>
				</div>
			</section>
		{/if}

		<!-- ORGANIZER -->
		{#if data.user?.role === 'organizer' || data.user?.role === 'admin'}
			<section class="role-section organizer-section">
				<div class="role-number">
					{data.user?.role === 'admin' ? '05' : '04'}
				</div>

				<div class="role-content">
					<p class="eyebrow">ORGANIZER</p>
					<h2>Run<br />an event.</h2>
					<p class="role-description">
						Create and manage your own hackathon,
						configure tracks and control submissions.
					</p>
				</div>

				<div class="role-actions">
					<a href="/events/new" class="button primary">
						Create event <span>↗</span>
					</a>

					<a href="/events/manage" class="button">
						Manage events <span>→</span>
					</a>
				</div>
			</section>
		{/if}

		<!-- JUDGE -->
		{#if data.user?.role === 'judge'}
			<section class="role-section judge-section">
				<div class="role-number">04</div>

				<div class="role-content">
					<p class="eyebrow">JUDGE</p>
					<h2>Ready<br />to judge.</h2>
					<p class="role-description">
						Access your assigned projects and judging
						workspace.
					</p>
				</div>

				<div class="role-actions">
					<a href="/judging" class="button primary">
						Open judging <span>↗</span>
					</a>
				</div>
			</section>
		{/if}

		<!-- ADMIN -->
		{#if data.user?.role === 'admin'}
			<section class="role-section admin-section">
				<div class="role-number">06</div>

				<div class="role-content">
					<p class="eyebrow">ADMIN</p>
					<h2>System<br />control.</h2>
					<p class="role-description">
						Manage users and control the public platform.
					</p>
				</div>

				<div class="role-actions">
					<a href="/admin" class="button primary">
						Admin dashboard <span>↗</span>
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
		<div class="footer-main">
			<div class="footer-brand">
				<span class="footer-mark">D</span>
				<strong>DOGFOOD</strong>
			</div>

			<p>
				Hackathon infrastructure,<br />
				without the hosted dependency.
			</p>
		</div>

		<div class="footer-links">
			<a href="/events">Events</a>
			<a href="/projects">Gallery</a>

			{#if !data.user}
				<a href="/login">Log in</a>
				<a href="/signup">Sign up</a>
			{/if}
		</div>

		<div class="footer-bottom">
			<span>OPEN SOURCE / SELF-HOSTABLE</span>
			<span>DOGFOOD 2026</span>
		</div>
	</footer>
</div>

<style>
	:global(html) {
		background: #f3f0e8;
		scroll-behavior: smooth;
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

	:global(::selection) {
		background: #111;
		color: #f3f0e8;
	}

	.site {
		min-height: 100vh;
		background: #f3f0e8;
		overflow: hidden;
	}

	main {
		max-width: 1500px;
		margin: 0 auto;
	}

	/* HERO */

	.hero {
		min-height: calc(100vh - 78px);
		padding: 3rem 2rem 3rem;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		border-bottom: 2px solid #111;
	}

	.hero-top {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 2rem;
	}

	.hero-meta {
		display: flex;
		gap: 2rem;
		font-size: 0.67rem;
		font-weight: 900;
		letter-spacing: 0.11em;
	}

	.hero-status {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.62rem;
		font-weight: 900;
		letter-spacing: 0.1em;
		text-align: right;
	}

	.status-dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: #111;
		animation: pulse 1.8s ease-in-out infinite;
	}

	.hero-title-wrap {
		margin: 7rem 0 5rem;
	}

	.hero-kicker {
		margin: 0 0 1.5rem;
		font-size: 0.72rem;
		font-weight: 900;
		letter-spacing: 0.12em;
	}

	h1 {
		font-size: clamp(5rem, 14vw, 13rem);
		line-height: 0.76;
		letter-spacing: -0.085em;
		margin: 0;
		font-weight: 950;
		max-width: 1250px;
	}

	h1 span {
		display: inline-block;
		-webkit-text-stroke: 2px #111;
		color: transparent;
		transition: color 300ms ease;
	}

	h1 span:hover {
		color: #111;
	}

	.hero-bottom {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 3rem;
		align-items: end;
	}

	.hero-bottom p {
		max-width: 32rem;
		font-size: 1.15rem;
		line-height: 1.4;
		margin: 0;
	}

	.hero-actions,
	.role-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.7rem;
		justify-content: flex-end;
	}

	.button {
		display: inline-flex;
		align-items: center;
		justify-content: space-between;
		gap: 2rem;
		min-width: 150px;
		padding: 0.9rem 1rem;
		border: 2px solid #111;
		color: #111;
		background: transparent;
		text-decoration: none;
		font-size: 0.75rem;
		font-weight: 900;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		transition:
			background 180ms ease,
			color 180ms ease,
			transform 180ms ease;
	}

	.button:hover {
		background: #111;
		color: #f3f0e8;
		transform: translateY(-3px);
	}

	.button span {
		font-size: 1rem;
	}

	.button.primary {
		background: #111;
		color: #f3f0e8;
	}

	.button.primary:hover {
		background: transparent;
		color: #111;
	}

	/* MARQUEE */

	.marquee {
		width: 100%;
		overflow: hidden;
		border-bottom: 2px solid #111;
		background: #111;
		color: #f3f0e8;
		padding: 0.85rem 0;
	}

	.marquee-track {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		width: max-content;
		animation: marquee 24s linear infinite;
		font-size: clamp(1rem, 2vw, 1.5rem);
		font-weight: 950;
		letter-spacing: -0.04em;
	}

	.marquee-track i {
		font-style: normal;
		font-size: 0.75em;
	}

	/* SECTIONS */

	.section {
		padding: 7rem 2rem;
		border-bottom: 2px solid #111;
	}

	.section-header {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 3rem;
		margin-bottom: 4rem;
	}

	.eyebrow {
		margin: 0 0 1rem;
		font-size: 0.68rem;
		font-weight: 900;
		letter-spacing: 0.12em;
	}

	h2 {
		font-size: clamp(4rem, 8vw, 8rem);
		line-height: 0.78;
		letter-spacing: -0.08em;
		margin: 0;
		font-weight: 950;
	}

	.section-side {
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		align-items: flex-end;
		gap: 2rem;
	}

	.section-side p {
		max-width: 27rem;
		font-size: 1rem;
		line-height: 1.5;
		margin: 0;
		align-self: flex-end;
	}

	.text-link {
		color: inherit;
		font-size: 0.72rem;
		font-weight: 900;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		text-decoration: none;
		border-bottom: 2px solid #111;
		padding-bottom: 0.3rem;
		transition:
			padding 180ms ease,
			background 180ms ease,
			color 180ms ease;
	}

	.text-link:hover {
		background: #111;
		color: #f3f0e8;
		padding: 0.3rem 0.5rem;
	}

	/* EVENTS */

	.event-list {
		border-top: 2px solid #111;
	}

	.event-row {
		display: grid;
		grid-template-columns: 70px 1fr 180px 30px;
		gap: 1.5rem;
		align-items: center;
		padding: 1.6rem 0;
		border-bottom: 2px solid #111;
		color: inherit;
		text-decoration: none;
		transition:
			background 180ms ease,
			color 180ms ease,
			padding 180ms ease;
	}

	.event-row:hover {
		background: #111;
		color: #f3f0e8;
		padding-left: 1rem;
		padding-right: 1rem;
	}

	.event-number {
		font-size: 0.72rem;
		font-weight: 900;
	}

	.event-title {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.event-title h3 {
		font-size: clamp(1.5rem, 3vw, 2.3rem);
		margin: 0;
		letter-spacing: -0.05em;
	}

	.event-main p {
		margin: 0.5rem 0 0;
		max-width: 650px;
		opacity: 0.65;
		line-height: 1.4;
	}

	.status {
		padding: 0.3rem 0.5rem;
		border: 1px solid currentColor;
		font-size: 0.58rem;
		font-weight: 900;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.event-date {
		display: grid;
		gap: 0.25rem;
		font-size: 0.7rem;
	}

	.event-date span {
		font-weight: 900;
		letter-spacing: 0.08em;
		opacity: 0.6;
	}

	.event-date strong {
		font-size: 0.85rem;
	}

	.arrow {
		font-size: 1.4rem;
		font-weight: 900;
		transition: transform 180ms ease;
	}

	.event-row:hover .arrow {
		transform: translate(4px, -4px);
	}

	/* EMPTY */

	.empty {
		border: 2px solid #111;
		padding: 2rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 2rem;
	}

	.empty p {
		margin: 0;
		font-weight: 800;
	}

	.empty-number {
		font-size: 3rem;
		font-weight: 950;
		display: block;
		margin-bottom: 0.5rem;
	}

	.empty a {
		color: inherit;
		font-weight: 900;
	}

	/* GALLERY */

	.gallery-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1.2rem;
	}

	.project-card {
		color: inherit;
		text-decoration: none;
		border: 2px solid #111;
		overflow: hidden;
		transition:
			transform 220ms ease,
			box-shadow 220ms ease;
	}

	.project-card:hover {
		transform: translateY(-7px);
		box-shadow: 8px 8px 0 #111;
	}

	.project-image {
		position: relative;
		aspect-ratio: 16 / 10;
		border-bottom: 2px solid #111;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #ddd9cf;
		font-size: 0.65rem;
		font-weight: 900;
		overflow: hidden;
	}

	.project-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		transition: transform 450ms ease;
	}

	.project-card:hover .project-image img {
		transform: scale(1.04);
	}

	.project-index {
		position: absolute;
		z-index: 2;
		top: 0.7rem;
		left: 0.7rem;
		padding: 0.35rem 0.45rem;
		background: #f3f0e8;
		border: 1px solid #111;
		font-size: 0.6rem;
		font-weight: 900;
	}

	.image-arrow {
		position: absolute;
		right: 0.7rem;
		bottom: 0.7rem;
		z-index: 2;
		width: 32px;
		height: 32px;
		display: grid;
		place-items: center;
		background: #111;
		color: #f3f0e8;
		font-weight: 900;
		transform: translateY(8px);
		opacity: 0;
		transition:
			opacity 180ms ease,
			transform 180ms ease;
	}

	.project-card:hover .image-arrow {
		opacity: 1;
		transform: translateY(0);
	}

	.project-info {
		padding: 1.25rem;
	}

	.project-event {
		font-size: 0.6rem;
		font-weight: 900;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		margin: 0 0 1rem;
		opacity: 0.6;
	}

	.project-info h3 {
		font-size: 1.8rem;
		line-height: 0.9;
		letter-spacing: -0.05em;
		margin: 0 0 0.75rem;
	}

	.project-info > p:last-child {
		margin: 0;
		opacity: 0.65;
		line-height: 1.4;
	}

	/* ROLE SECTIONS */

	.role-section {
		padding: 5rem 2rem;
		border-bottom: 2px solid #111;
		display: grid;
		grid-template-columns: 70px 1fr 1fr;
		gap: 3rem;
		align-items: end;
	}

	.role-number {
		font-size: 0.72rem;
		font-weight: 900;
		align-self: start;
	}

	.role-content h2 {
		margin-bottom: 1.5rem;
	}

	.role-description {
		max-width: 32rem;
		font-size: 1.05rem;
		line-height: 1.5;
		margin: 0;
		opacity: 0.7;
	}

	/* FOOTER */

	footer {
		max-width: 1500px;
		margin: 0 auto;
		padding: 4rem 2rem 2rem;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4rem;
	}

	.footer-main {
		display: grid;
		gap: 1rem;
	}

	.footer-brand {
		display: flex;
		align-items: center;
		gap: 0.7rem;
	}

	.footer-mark {
		width: 34px;
		height: 34px;
		display: grid;
		place-items: center;
		border: 2px solid #111;
		font-weight: 950;
	}

	.footer-brand strong {
		font-size: 1.1rem;
		letter-spacing: -0.04em;
	}

	.footer-main p {
		margin: 0;
		font-size: 0.85rem;
		line-height: 1.5;
		opacity: 0.6;
	}

	.footer-links {
		display: flex;
		justify-content: flex-end;
		align-items: flex-start;
		gap: 1.5rem;
		flex-wrap: wrap;
	}

	.footer-links a {
		color: inherit;
		font-size: 0.7rem;
		font-weight: 900;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		text-decoration: none;
		border-bottom: 1px solid transparent;
	}

	.footer-links a:hover {
		border-bottom-color: #111;
	}

	.footer-bottom {
		grid-column: 1 / -1;
		padding-top: 1.5rem;
		border-top: 1px solid #111;
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		font-size: 0.6rem;
		font-weight: 900;
		letter-spacing: 0.1em;
		opacity: 0.55;
	}

	/* MOTION */

	@keyframes marquee {
		from {
			transform: translateX(0);
		}

		to {
			transform: translateX(-50%);
		}
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
			transform: scale(1);
		}

		50% {
			opacity: 0.35;
			transform: scale(0.7);
		}
	}

	/* MOBILE */

	@media (max-width: 800px) {
		.hero {
			min-height: auto;
			padding: 2.5rem 1rem 3rem;
		}

		.hero-top {
			flex-direction: column;
			gap: 1rem;
		}

		.hero-meta {
			flex-direction: column;
			gap: 0.5rem;
		}

		.hero-status {
			text-align: left;
		}

		.hero-title-wrap {
			margin: 7rem 0;
		}

		h1 {
			font-size: clamp(4.2rem, 18vw, 8rem);
		}

		.hero-bottom {
			grid-template-columns: 1fr;
			gap: 2rem;
		}

		.hero-actions,
		.role-actions {
			justify-content: flex-start;
		}

		.section {
			padding: 5rem 1rem;
		}

		.section-header {
			grid-template-columns: 1fr;
			gap: 2rem;
			margin-bottom: 3rem;
		}

		.section-side {
			align-items: flex-start;
		}

		.section-side p {
			align-self: flex-start;
		}

		h2 {
			font-size: clamp(3.8rem, 16vw, 7rem);
		}

		.event-row {
			grid-template-columns: 35px 1fr 25px;
			gap: 0.8rem;
		}

		.event-date {
			display: none;
		}

		.event-title {
			gap: 0.5rem;
		}

		.event-title h3 {
			font-size: 1.5rem;
		}

		.event-main p {
			font-size: 0.85rem;
		}

		.gallery-grid {
			grid-template-columns: 1fr;
		}

		.role-section {
			grid-template-columns: 35px 1fr;
			gap: 1rem;
			padding: 4rem 1rem;
		}

		.role-content {
			grid-column: 2;
		}

		.role-actions {
			grid-column: 2;
		}

		footer {
			grid-template-columns: 1fr;
			padding: 3rem 1rem 1.5rem;
			gap: 2rem;
		}

		.footer-links {
			justify-content: flex-start;
		}

		.footer-bottom {
			grid-column: 1;
			flex-direction: column;
			gap: 0.5rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		:global(html) {
			scroll-behavior: auto;
		}

		.marquee-track {
			animation: none;
		}

		.status-dot {
			animation: none;
		}

		* {
			transition-duration: 0.01ms !important;
		}
	}
</style>