<script lang="ts">
	let { data, form } = $props();

	function date(value: Date | string | null) {
		if (!value) return 'Not specified';

		return new Date(value).toLocaleString();
	}
</script>

<svelte:head>
	<title>{data.event.name} — DOGFOOD</title>
</svelte:head>

<div class="page">
	<header>
		<a href="/events">← EVENTS</a>
		<a href="/projects">GALLERY →</a>
	</header>

	<main>
		<p class="eyebrow">EVENT</p>

		<h1>{data.event.name}</h1>

		{#if data.event.tagline}
			<p class="tagline">{data.event.tagline}</p>
		{/if}

		{#if data.event.about}
			<section>
				<h2>About</h2>
				<p>{data.event.about}</p>
			</section>
		{/if}

		<section class="details">
			<div>
				<strong>TEAM SIZE</strong>
				<span>
					{data.event.minTeamSize}–
					{data.event.maxTeamSize}
				</span>
			</div>

			<div>
				<strong>APPLICATION CLOSES</strong>
				<span>{date(data.event.applicationCloseAt)}</span>
			</div>
		</section>

		{#if data.user}
			<section class="team">
				<h2>Your team</h2>

				{#if data.team}
					<div class="team-box">
						<strong>{data.team.teamName}</strong>

						{#if data.team.leaderEmail === data.user.email}
							<p>You are the team leader.</p>
							<p>
								Create an invite link from the team
								management area.
							</p>
						{:else}
							<p>You are a team member.</p>
						{/if}
					</div>
				{:else}
					{#if form?.error}
						<div class="error">{form.error}</div>
					{/if}

					<form method="POST" action="?/createTeam">
						<label>
							Team name
							<input
								name="teamName"
								required
								maxlength="200"
							/>
						</label>

						<button type="submit">
							Register & create team →
						</button>
					</form>
				{/if}
			</section>
		{:else}
			<section class="login">
				<h2>Ready to participate?</h2>
				<a href="/login">Log in →</a>
			</section>
		{/if}
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
		max-width: 1000px;
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

	.tagline {
		font-size: 1.5rem;
		max-width: 700px;
		line-height: 1.4;
	}

	section {
		border-top: 2px solid #111;
		padding-top: 2rem;
		margin-top: 5rem;
	}

	h2 {
		font-size: 2rem;
	}

	p {
		line-height: 1.6;
	}

	.details {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	.details div {
		border: 2px solid #111;
		padding: 1.5rem;
		display: grid;
		gap: 1rem;
	}

	.details strong {
		font-size: 0.7rem;
	}

	.team-box {
		border: 2px solid #111;
		padding: 1.5rem;
		font-size: 1.2rem;
	}

	label {
		display: grid;
		gap: 0.5rem;
		font-weight: 900;
		max-width: 600px;
	}

	input {
		border: 2px solid #111;
		padding: 1rem;
		font: inherit;
		background: white;
	}

	button,
	.login a {
		display: inline-block;
		margin-top: 1rem;
		border: 2px solid #111;
		background: #111;
		color: #f3f0e8;
		padding: 1rem 1.25rem;
		font: inherit;
		font-weight: 900;
		text-decoration: none;
		cursor: pointer;
	}

	.error {
		border: 2px solid #111;
		padding: 1rem;
		background: #e8b9a9;
		margin-bottom: 1.5rem;
		font-weight: 900;
	}

	@media (max-width: 650px) {
		.details {
			grid-template-columns: 1fr;
		}
	}
</style>