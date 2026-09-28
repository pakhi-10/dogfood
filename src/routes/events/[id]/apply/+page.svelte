<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';

	let { data, form } = $props();

	let teamName = $state(
		data.mode === 'create'
			? ''
			: data.team?.name ?? ''
	);

	let inviteUrl = $state('');
	let copied = $state(false);

	const formatDate = (
		date: string | Date | null
	) => {
		if (!date) return 'TBA';

		return new Intl.DateTimeFormat(
			'en-IN',
			{
				dateStyle: 'medium'
			}
		).format(new Date(date));
	};

	const copyInvite = async () => {
		if (!inviteUrl) return;

		await navigator.clipboard.writeText(
			inviteUrl
		);

		copied = true;

		setTimeout(() => {
			copied = false;
		}, 1800);
	};

	$effect(() => {
		if (
			form?.success &&
			form.inviteUrl
		) {
			inviteUrl =
				`${window.location.origin}${form.inviteUrl}`;
		}
	});
</script>

<svelte:head>
	<title>
		{data.mode === 'invite'
			? `Team Invitation — ${data.event.name}`
			: `Team — ${data.event.name}`}
		— DOGFOOD
	</title>
</svelte:head>

<div class="page">
	<Navbar user={data.user} />

	<main>
		<a
			href={`/events/${data.event.id}`}
			class="back"
		>
			← Back to event
		</a>

		<header class="header">
			<p class="eyebrow">
				{data.mode === 'invite'
					? 'TEAM INVITATION'
					: data.mode === 'create'
						? 'TEAM FORMATION'
						: 'MANAGE TEAM'}
			</p>

			<h1>{data.event.name}</h1>

			{#if data.event.tagline}
				<p class="tagline">
					{data.event.tagline}
				</p>
			{/if}
		</header>

		{#if form?.error}
			<div class="error">
				{form.error}
			</div>
		{/if}

		{#if data.mode === 'invalid-invite'}
			<section class="panel">
				<p class="eyebrow">INVITE UNAVAILABLE</p>

				<h2>
					This invitation is no longer valid.
				</h2>

				<p>
					The invite may have expired or been
					removed. Ask the team leader to
					generate a new link.
				</p>

				<a
					href={`/events/${data.event.id}`}
					class="button primary"
				>
					Back to event →
				</a>
			</section>

		{:else if data.mode === 'invite'}
			<section class="panel">
				<p class="eyebrow">YOU'RE INVITED</p>

				<h2>
					Join {data.invite.teamName}.
				</h2>

				<p class="lead">
					{data.invite.leaderName} has invited
					you to join this team for
					{data.event.name}.
				</p>

				<div class="invite-meta">
					<div>
						<span>TEAM</span>
						<strong>
							{data.invite.teamName}
						</strong>
					</div>

					<div>
						<span>TEAM SIZE</span>
						<strong>
							{data.memberCount} /
							{data.event.maxTeamSize}
						</strong>
					</div>

					<div>
						<span>INVITE EXPIRES</span>
						<strong>
							{formatDate(
								data.invite.expiresAt
							)}
						</strong>
					</div>
				</div>

				{#if data.invite.alreadyMember}
					<div class="notice">
						You are already a member of
						this team.
					</div>

					<a
						href={`/events/${data.event.id}/apply`}
						class="button primary"
					>
						Manage team →
					</a>
				{:else if !data.applicationOpen}
					<div class="notice">
						The application period has
						closed.
					</div>
				{:else}
					<form
						method="POST"
						action="?/acceptInvite"
					>
						<input
							type="hidden"
							name="token"
							value={new URLSearchParams(
								window.location.search
							).get('invite') ?? ''}
						/>

						<button
							type="submit"
							class="button primary"
						>
							Accept invite →
						</button>
					</form>
				{/if}
			</section>

		{:else if data.mode === 'create'}
			<section class="panel">
				<p class="eyebrow">
					START YOUR APPLICATION
				</p>

				<h2>
					Create your team.
				</h2>

				<p class="lead">
					Your registered account will
					automatically become the team
					leader. You can invite your
					teammates after creating the team.
				</p>

				<div class="invite-meta">
					<div>
						<span>YOUR NAME</span>
						<strong>
							{data.user.name}
						</strong>
					</div>

					<div>
						<span>YOUR EMAIL</span>
						<strong>
							{data.user.email}
						</strong>
					</div>

					<div>
						<span>TEAM SIZE</span>
						<strong>
							{data.event.minTeamSize}–
							{data.event.maxTeamSize}
						</strong>
					</div>
				</div>

				<form
					method="POST"
					action="?/createTeam"
					class="form"
				>
					<label for="teamName">
						Team name
					</label>

					<input
						id="teamName"
						name="teamName"
						bind:value={teamName}
						placeholder="e.g. Neural Nomads"
						required
					/>

					<button
						type="submit"
						class="button primary"
					>
						Create team →
					</button>
				</form>
			</section>

		{:else}
			<section class="panel">
				<div class="team-heading">
					<div>
						<p class="eyebrow">
							YOUR TEAM
						</p>

						<h2>
							{data.team.name}
						</h2>
					</div>

					<div class="team-count">
						{data.members.length}
						/
						{data.event.maxTeamSize}
						MEMBERS
					</div>
				</div>

				{#if data.applicationOpen}
					<div class="team-edit">
						<form
							method="POST"
							action="?/updateTeam"
							class="team-name-form"
						>
							<label for="editTeamName">
								Team name
							</label>

							<div>
								<input
									id="editTeamName"
									name="teamName"
									bind:value={teamName}
									required
								/>

								{#if data.team.isLeader}
									<button
										type="submit"
										class="button"
									>
										Save
									</button>
								{/if}
							</div>
						</form>
					</div>
				{/if}

				<div class="members">
					{#each data.members as member, index}
						<article class="member">
							<div class="member-number">
								{String(
									index + 1
								).padStart(2, '0')}
							</div>

							<div class="member-main">
								<div class="member-top">
									<h3>
										{member.name ??
											member.email}
									</h3>

									{#if member.email === data.team.leaderEmail}
										<span class="badge">
											LEADER
										</span>
									{:else if member.email === data.user.email}
										<span class="badge">
											YOU
										</span>
									{/if}
								</div>

								<p>
									{member.email}
								</p>
							</div>

							{#if data.team.isLeader &&
								member.email !==
									data.team.leaderEmail &&
								data.applicationOpen}
								<form
									method="POST"
									action="?/removeMember"
								>
									<input
										type="hidden"
										name="memberId"
										value={member.id}
									/>

									<button
										type="submit"
										class="remove"
									>
										Remove
									</button>
								</form>
							{/if}
						</article>
					{/each}
				</div>
			</section>

			{#if data.team.isLeader &&
				data.applicationOpen &&
				data.members.length <
					data.event.maxTeamSize}
				<section class="panel invite-panel">
					<p class="eyebrow">
						ADD TEAM MEMBERS
					</p>

					<h2>
						Send an invite.
					</h2>

					<p class="lead">
						Generate a private invite link
						and send it to your teammates.
						Anyone who accepts must be
						logged into their DOGFOOD
						participant account.
					</p>

					<form
						method="POST"
						action="?/generateInvite"
					>
						<button
							type="submit"
							class="button primary"
						>
							Generate invite link →
						</button>
					</form>

					{#if inviteUrl}
						<div class="invite-result">
							<input
								value={inviteUrl}
								readonly
							/>

							<button
								type="button"
								class="button"
								onclick={copyInvite}
							>
								{copied
									? 'Copied'
									: 'Copy link'}
							</button>
						</div>
					{/if}

					{#if form?.success &&
						form.message}
						<p class="success">
							{form.message}
						</p>
					{/if}
				</section>
			{/if}

			{#if !data.applicationOpen}
				<section class="closed">
					<p class="eyebrow">
						APPLICATION CLOSED
					</p>

					<h2>
						Team formation is closed.
					</h2>

					<p>
						Your team is registered for
						this event. Submission is now
						available.
					</p>

					<a
						href={`/projects/new?eventId=${data.event.id}`}
						class="button primary"
					>
						Submit project →
					</a>
				</section>
			{/if}
		{/if}
	</main>
</div>

<style>
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

	main {
		max-width: 1050px;
		margin: 0 auto;
		padding: 48px 24px 100px;
	}

	.back {
		display: inline-block;
		margin-bottom: 56px;
		color: #111;
		text-decoration: none;
		font-size: 13px;
		font-weight: 800;
	}

	.header {
		padding-bottom: 48px;
		border-bottom: 2px solid #111;
	}

	.eyebrow {
		margin: 0 0 12px;
		font-size: 11px;
		font-weight: 900;
		letter-spacing: 0.12em;
	}

	h1 {
		margin: 0;
		font-size: clamp(48px, 9vw, 110px);
		line-height: 0.85;
		letter-spacing: -0.07em;
	}

	h2 {
		margin: 0;
		font-size: clamp(36px, 6vw, 70px);
		line-height: 0.9;
		letter-spacing: -0.06em;
	}

	.tagline {
		max-width: 650px;
		margin: 24px 0 0;
		font-size: 18px;
		line-height: 1.5;
		opacity: 0.65;
	}

	.panel {
		margin-top: 36px;
		padding: 32px;
		border: 2px solid #111;
	}

	.lead {
		max-width: 650px;
		font-size: 16px;
		line-height: 1.6;
		opacity: 0.7;
	}

	.invite-meta {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		border-top: 1px solid #111;
		border-bottom: 1px solid #111;
		margin: 30px 0;
	}

	.invite-meta div {
		padding: 18px 0;
	}

	.invite-meta div + div {
		border-left: 1px solid #bbb;
		padding-left: 20px;
	}

	.invite-meta span {
		display: block;
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 0.08em;
		opacity: 0.55;
		margin-bottom: 6px;
	}

	.invite-meta strong {
		font-size: 14px;
	}

	.form {
		display: grid;
		gap: 10px;
		max-width: 650px;
		margin-top: 30px;
	}

	.form label,
	.team-name-form label {
		font-size: 11px;
		font-weight: 900;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	input {
		width: 100%;
		box-sizing: border-box;
		padding: 14px;
		border: 2px solid #111;
		background: transparent;
		color: #111;
		font: inherit;
	}

	.button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 46px;
		padding: 0 20px;
		border: 2px solid #111;
		background: transparent;
		color: #111;
		text-decoration: none;
		font: inherit;
		font-size: 12px;
		font-weight: 900;
		text-transform: uppercase;
		cursor: pointer;
	}

	.button.primary {
		background: #111;
		color: #f3f0e8;
	}

	.notice,
	.error,
	.success {
		padding: 14px 16px;
		border: 2px solid #111;
		margin: 20px 0;
		font-size: 13px;
		font-weight: 700;
		line-height: 1.5;
	}

	.error {
		margin-top: 24px;
	}

	.team-heading {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 24px;
	}

	.team-count {
		font-size: 11px;
		font-weight: 900;
		letter-spacing: 0.08em;
	}

	.team-edit {
		margin-top: 32px;
		padding-top: 24px;
		border-top: 1px solid #111;
	}

	.team-name-form {
		display: grid;
		gap: 9px;
		max-width: 700px;
	}

	.team-name-form > div {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 10px;
	}

	.members {
		margin-top: 32px;
		border-top: 2px solid #111;
	}

	.member {
		display: grid;
		grid-template-columns: 55px 1fr auto;
		gap: 20px;
		align-items: center;
		padding: 20px 0;
		border-bottom: 1px solid #111;
	}

	.member-number {
		font-size: 11px;
		font-weight: 900;
	}

	.member-top {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
	}

	.member-main h3 {
		margin: 0;
		font-size: 22px;
		letter-spacing: -0.03em;
	}

	.member-main p {
		margin: 5px 0 0;
		font-size: 13px;
		opacity: 0.6;
	}

	.badge {
		padding: 4px 7px;
		border: 1px solid #111;
		font-size: 9px;
		font-weight: 900;
		letter-spacing: 0.08em;
	}

	.remove {
		border: 0;
		background: transparent;
		color: #111;
		font: inherit;
		font-size: 11px;
		font-weight: 900;
		text-decoration: underline;
		cursor: pointer;
	}

	.invite-panel {
		display: grid;
		gap: 16px;
	}

	.invite-result {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 10px;
		margin-top: 8px;
	}

	.closed {
		margin-top: 36px;
		padding: 32px;
		border: 2px solid #111;
		background: #111;
		color: #f3f0e8;
	}

	.closed .button {
		margin-top: 12px;
		border-color: #f3f0e8;
		background: #f3f0e8;
		color: #111;
	}

	@media (max-width: 700px) {
		main {
			padding: 32px 16px 70px;
		}

		.panel {
			padding: 22px;
		}

		.invite-meta {
			grid-template-columns: 1fr;
		}

		.invite-meta div + div {
			border-left: 0;
			border-top: 1px solid #bbb;
			padding-left: 0;
		}

		.team-heading {
			align-items: flex-start;
			flex-direction: column;
		}

		.team-name-form > div,
		.invite-result {
			grid-template-columns: 1fr;
		}

		.member {
			grid-template-columns: 35px 1fr;
		}

		.member > form {
			grid-column: 2;
		}
	}
</style>