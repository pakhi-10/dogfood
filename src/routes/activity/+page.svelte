<script lang="ts">
	let { data } = $props();

	const formatDate = (date: string | Date | null) => {
		if (!date) return 'TBA';

		return new Intl.DateTimeFormat('en-IN', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		}).format(new Date(date));
	};

	const getProjectStatus = (
		submittedAt: string | Date | null,
		endAt: string | Date | null
	) => {
		if (!submittedAt) return 'DRAFT';

		if (endAt && new Date(endAt) < new Date()) {
			return 'SUBMITTED';
		}

		return 'SUBMITTED';
	};
</script>

<svelte:head>
	<title>My Activity — DOGFOOD</title>
</svelte:head>

<div class="page"> 
	<header class="topbar">
		<a href="/" class="brand">DOGFOOD</a>

```
	<nav>
		<a href="/events">Events</a>
		<a href="/projects">Gallery</a>
		<a href="/activity" class="active">My activity</a>
	</nav>
</header>

<main>
	<section class="hero">
		<div class="eyebrow">ACCOUNT / ACTIVITY</div>

		<div class="hero-grid">
			<div>
				<h1>
					My<br />
					activity.
				</h1>
			</div>

			<div class="hero-copy">
				<p class="welcome">
					Welcome back,
					<strong>{data.user.name}</strong>.
				</p>

				<p>
					Track your teams, events and project
					submissions from one place.
				</p>
			</div>
		</div>
	</section>

	<section class="section">
		<div class="section-heading">
			<div>
				<p class="eyebrow">01 / TEAMS</p>
				<h2>Your teams.</h2>
			</div>

			<a href="/events" class="text-link">
				Find events →
			</a>
		</div>

		{#if data.teams.length === 0}
			<div class="empty">
				<div>
					<strong>No teams yet.</strong>
					<p>
						Register for an event and create or join
						a team to get started.
					</p>
				</div>

				<a href="/events" class="button">
					Explore events →
				</a>
			</div>
		{:else}
			<div class="team-list">
				{#each data.teams as team, index}
					<a
						href={`/events/${team.eventId}/team`}
						class="team-row"
					>
						<div class="number">
							{String(index + 1).padStart(2, '0')}
						</div>

						<div class="team-main">
							<h3>{team.teamName}</h3>

							<p>{team.eventName}</p>
						</div>

						<div class="team-role">
							{#if team.leaderEmail === data.user.email}
								<span>TEAM LEAD</span>
							{:else}
								<span>MEMBER</span>
							{/if}
						</div>

						<div class="arrow">↗</div>
					</a>
				{/each}
			</div>
		{/if}
	</section>

	<section class="section projects-section">
		<div class="section-heading">
			<div>
				<p class="eyebrow">02 / PROJECTS</p>
				<h2>Your projects.</h2>
			</div>

			<a href="/projects/new" class="text-link">
				New project →
			</a>
		</div>

		{#if data.projects.length === 0}
			<div class="empty">
				<div>
					<strong>No project submissions yet.</strong>

					<p>
						Once your team has a project, it will appear
						here.
					</p>
				</div>
			</div>
		{:else}
			<div class="project-list">
				{#each data.projects as project}
					<a
						href={`/projects/${project.id}`}
						class="project-row"
					>
						<div class="project-main">
							<div class="project-meta">
								<span>
									{project.eventName}
								</span>

								<span> / </span>

								<span>
									{project.trackName}
								</span>
							</div>

							<h3>{project.title}</h3>

							{#if project.projectTagline}
								<p>{project.projectTagline}</p>
							{/if}

							<div class="project-team">
								TEAM / {project.teamName}
							</div>
						</div>

						<div class="project-status">
							<span>
								{getProjectStatus(
									project.submittedAt,
									project.stageEndAt
								)}
							</span>

							<strong>
								{formatDate(project.submittedAt)}
							</strong>
						</div>

						<div class="arrow">↗</div>
					</a>
				{/each}
			</div>
		{/if}
	</section>

	<section class="action-section">
		<div>
			<p class="eyebrow">KEEP BUILDING</p>

			<h2>
				Find your<br />
				next event.
			</h2>
		</div>

		<a href="/events" class="big-button">
			Explore events →
		</a>
	</section>
</main>

<footer>
	<div>
		<strong>DOGFOOD</strong>
		<span>Hackathon infrastructure, without the hosted dependency.</span>
	</div>

	<a href="/">Back home →</a>
</footer>
```

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

	.page {
		min-height: 100vh;
		background: #f3f0e8;
	}

	.topbar {
		height: 78px;
		padding: 0 2rem;
		border-bottom: 2px solid #111;

		display: flex;
		align-items: center;
		justify-content: space-between;

		position: sticky;
		top: 0;
		z-index: 10;

		background: rgba(243, 240, 232, 0.94);
		backdrop-filter: blur(12px);
	}

	.brand {
		color: inherit;
		text-decoration: none;
		font-size: 1.2rem;
		font-weight: 950;
		letter-spacing: -0.04em;
	}

	nav {
		display: flex;
		gap: 1.5rem;
	}

	nav a {
		color: inherit;
		text-decoration: none;
		font-size: 0.8rem;
		font-weight: 900;
	}

	nav a:hover,
	nav a.active {
		text-decoration: underline;
		text-underline-offset: 5px;
	}

	main {
		max-width: 1500px;
		margin: 0 auto;
	}

	.hero {
		padding: 3rem 2rem 5rem;
		border-bottom: 2px solid #111;
	}

	.eyebrow {
		margin: 0 0 1rem;
		font-size: 0.68rem;
		font-weight: 950;
		letter-spacing: 0.12em;
	}

	.hero-grid {
		display: grid;
		grid-template-columns: 1.4fr 0.6fr;
		gap: 3rem;
		align-items: end;
	}

	h1 {
		font-size: clamp(5rem, 13vw, 12rem);
		line-height: 0.76;
		letter-spacing: -0.075em;
		margin: 4rem 0 0;
		font-weight: 950;
	}

	.hero-copy {
		max-width: 28rem;
		font-size: 1.1rem;
		line-height: 1.45;
	}

	.hero-copy p {
		margin: 0 0 1rem;
	}

	.welcome {
		font-size: 1.35rem;
	}

	.section {
		padding: 6rem 2rem;
		border-bottom: 2px solid #111;
	}

	.section-heading {
		display: flex;
		align-items: end;
		justify-content: space-between;
		gap: 2rem;
		margin-bottom: 3rem;
	}

	h2 {
		margin: 0;
		font-size: clamp(3.5rem, 8vw, 8rem);
		line-height: 0.8;
		letter-spacing: -0.07em;
		font-weight: 950;
	}

	.text-link {
		color: inherit;
		text-decoration: none;
		font-weight: 900;
		border-bottom: 2px solid #111;
		padding-bottom: 0.25rem;
	}

	.team-list,
	.project-list {
		border-top: 2px solid #111;
	}

	.team-row,
	.project-row {
		color: inherit;
		text-decoration: none;

		display: grid;
		grid-template-columns: 70px 1fr 160px 30px;
		gap: 1.5rem;
		align-items: center;

		border-bottom: 2px solid #111;
		padding: 1.5rem 0;

		transition:
			background 160ms ease,
			color 160ms ease,
			padding 160ms ease;
	}

	.team-row:hover,
	.project-row:hover {
		background: #111;
		color: #f3f0e8;
		padding-left: 1rem;
		padding-right: 1rem;
	}

	.number {
		font-size: 0.75rem;
		font-weight: 900;
	}

	.team-main h3,
	.project-main h3 {
		margin: 0;
		font-size: 2rem;
		line-height: 0.95;
		letter-spacing: -0.045em;
	}

	.team-main p {
		margin: 0.5rem 0 0;
		opacity: 0.65;
	}

	.team-role,
	.project-status {
		font-size: 0.65rem;
		font-weight: 900;
		letter-spacing: 0.08em;
		text-align: right;
	}

	.arrow {
		font-size: 1.5rem;
		font-weight: 900;
	}

	.empty {
		border: 2px solid #111;
		padding: 2rem;

		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 2rem;
	}

	.empty strong {
		font-size: 1.3rem;
	}

	.empty p {
		margin: 0.5rem 0 0;
		opacity: 0.65;
	}

	.button,
	.big-button {
		display: inline-block;
		color: inherit;
		text-decoration: none;
		border: 2px solid #111;
		font-weight: 900;
		padding: 0.9rem 1.1rem;
		transition:
			background 160ms ease,
			color 160ms ease;
	}

	.button:hover {
		background: #111;
		color: #f3f0e8;
	}

	.project-meta {
		margin-bottom: 0.75rem;
		font-size: 0.65rem;
		font-weight: 900;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.project-main > p {
		margin: 0.75rem 0;
		opacity: 0.65;
	}

	.project-team {
		margin-top: 1rem;
		font-size: 0.65rem;
		font-weight: 900;
		letter-spacing: 0.08em;
	}

	.project-status {
		display: grid;
		gap: 0.35rem;
	}

	.project-status strong {
		font-size: 0.8rem;
		letter-spacing: normal;
	}

	.action-section {
		padding: 6rem 2rem;
		border-bottom: 2px solid #111;

		display: flex;
		align-items: end;
		justify-content: space-between;
		gap: 3rem;
	}

	.big-button {
		background: #111;
		color: #f3f0e8;
		padding: 1.25rem 1.5rem;
	}

	.big-button:hover {
		background: transparent;
		color: #111;
	}

	footer {
		max-width: 1500px;
		margin: 0 auto;
		padding: 3rem 2rem;

		display: flex;
		justify-content: space-between;
		gap: 2rem;
	}

	footer div {
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

	footer a {
		color: inherit;
		font-weight: 900;
		text-decoration: none;
	}

	@media (max-width: 800px) {
		.topbar {
			padding: 0 1rem;
		}

		nav {
			gap: 0.75rem;
		}

		.hero,
		.section,
		.action-section {
			padding-left: 1rem;
			padding-right: 1rem;
		}

		.hero-grid {
			grid-template-columns: 1fr;
		}

		h1 {
			margin-top: 3rem;
			font-size: clamp(4rem, 20vw, 8rem);
		}

		.section-heading {
			align-items: flex-start;
			flex-direction: column;
		}

		.team-row,
		.project-row {
			grid-template-columns: 35px 1fr 25px;
		}

		.team-role,
		.project-status {
			display: none;
		}

		.empty,
		.action-section,
		footer {
			flex-direction: column;
			align-items: flex-start;
		}

		h2 {
			font-size: clamp(3rem, 15vw, 6rem);
		}
	}
</style>
