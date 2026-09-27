
<script lang="ts">
	let { data } = $props();

	let search = $state('');
	let roleFilter = $state('all');

	const roleLabels: Record<string, string> = {
		admin: 'Admin',
		organizer: 'Organizer',
		judge: 'Judge',
		participant: 'Participant',
		visitor: 'Visitor'
	};

	const filteredUsers = $derived(
		data.users.filter((user) => {
			const query = search.trim().toLowerCase();

			const matchesSearch =
				!query ||
				user.name.toLowerCase().includes(query) ||
				user.email.toLowerCase().includes(query) ||
				(user.username?.toLowerCase().includes(query) ?? false);

			const matchesRole =
				roleFilter === 'all' || user.role === roleFilter;

			return matchesSearch && matchesRole;
		})
	);

	const formatDate = (date: string | Date) => {
		return new Intl.DateTimeFormat('en-IN', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		}).format(new Date(date));
	};
</script>

<svelte:head>
	<title>User Control — DOGFOOD</title>
	<meta
		name="description"
		content="Administrative user control for DOGFOOD."
	/>
</svelte:head>

<div class="page">
	<header class="topbar">
		<a href="/" class="brand">DOGFOOD</a>

		<a href="/" class="back-link">
			← Dashboard
		</a>
	</header>

	<main>
		<section class="intro">
			<p class="eyebrow">ADMINISTRATION / USERS</p>

			<div class="intro-row">
				<div>
					<h1>User<br /><em>control.</em></h1>

					<p class="description">
						View registered users and their platform roles.
					</p>
				</div>

				<div class="user-count">
					<span>Total users</span>
					<strong>{data.users.length}</strong>
				</div>
			</div>
		</section>

		<section class="controls">
			<div class="search-wrap">
				<label for="user-search">Search users</label>

				<input
					id="user-search"
					type="search"
					bind:value={search}
					placeholder="Name, email or username"
				/>
			</div>

			<div class="filter-wrap">
				<label for="role-filter">Role</label>

				<select id="role-filter" bind:value={roleFilter}>
					<option value="all">All roles</option>
					<option value="admin">Admin</option>
					<option value="organizer">Organizer</option>
					<option value="judge">Judge</option>
					<option value="participant">Participant</option>
					<option value="visitor">Visitor</option>
				</select>
			</div>
		</section>

		<section class="users">
			<div class="users-header">
				<span>User</span>
				<span>Role</span>
				<span>Joined</span>
			</div>

			{#if filteredUsers.length === 0}
				<div class="empty">
					No users match your search.
				</div>
			{:else}
				{#each filteredUsers as user}
					<div class="user-row">
						<div class="user-info">
							<strong>{user.name}</strong>

							<span>{user.email}</span>

							
						</div>

						<div>
							<span class="role role-{user.role}">
								{roleLabels[user.role] ?? user.role}
							</span>
						</div>

						<div class="joined">
							{formatDate(user.createdAt)}
						</div>
					</div>
				{/each}
			{/if}
		</section>
	</main>
</div>

<style>
	:global(*) {
		box-sizing: border-box;
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

	.page {
		min-height: 100vh;
	}

	.topbar {
		height: 80px;
		padding: 0 6vw;
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1px solid #111;
	}

	.brand {
		font-size: 0.8rem;
		font-weight: 800;
		letter-spacing: 0.12em;
	}

	.back-link {
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.back-link:hover {
		text-decoration: underline;
	}

	main {
		padding: 6rem 6vw;
	}

	.intro {
		padding-bottom: 5rem;
		border-bottom: 1px solid #111;
	}

	.eyebrow {
		margin: 0 0 2rem;
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.intro-row {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 3rem;
	}

	h1 {
		margin: 0;
		font-size: clamp(5rem, 11vw, 10rem);
		line-height: 0.78;
		letter-spacing: -0.07em;
	}

	h1 em {
		font-style: italic;
	}

	.description {
		max-width: 400px;
		margin: 2.5rem 0 0;
		color: #555;
		line-height: 1.5;
	}

	.user-count {
		min-width: 180px;
		padding: 1.25rem;
		border: 1px solid #111;
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.user-count span {
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.user-count strong {
		font-size: 4rem;
		line-height: 0.8;
		letter-spacing: -0.06em;
	}

	.controls {
		display: grid;
		grid-template-columns: 1fr 240px;
		gap: 1rem;
		padding: 2rem 0;
		border-bottom: 1px solid #111;
	}

	.controls label {
		display: block;
		margin-bottom: 0.6rem;
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	input,
	select {
		width: 100%;
		height: 48px;
		padding: 0 0.9rem;
		border: 1px solid #111;
		border-radius: 0;
		background: transparent;
		color: #111;
		font: inherit;
		font-size: 0.85rem;
	}

	input:focus,
	select:focus {
		outline: 2px solid #111;
		outline-offset: 2px;
	}

	.users-header {
		display: grid;
		grid-template-columns: 1fr 180px 150px;
		gap: 2rem;
		padding: 1.25rem 0;
		border-bottom: 1px solid #111;
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.user-row {
		display: grid;
		grid-template-columns: 1fr 180px 150px;
		gap: 2rem;
		align-items: center;
		padding: 1.5rem 0;
		border-bottom: 1px solid #111;
	}

	.user-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.user-info strong {
		font-size: 1rem;
	}

	.user-info span,
	.user-info small {
		color: #666;
		font-size: 0.75rem;
	}

	.role {
		display: inline-block;
		padding: 0.35rem 0.55rem;
		border: 1px solid #111;
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.role-admin {
		background: #111;
		color: #f4f0e8;
	}

	.role-organizer {
		background: #ddd7c9;
	}

	.joined {
		font-size: 0.75rem;
		color: #555;
	}

	.empty {
		padding: 4rem 0;
		border-bottom: 1px solid #111;
		color: #555;
	}

	@media (max-width: 800px) {
		main {
			padding: 4rem 5vw;
		}

		.intro-row {
			align-items: flex-start;
			flex-direction: column;
		}

		.user-count {
			width: 100%;
		}

		.controls {
			grid-template-columns: 1fr;
		}

		.users-header {
			display: none;
		}

		.user-row {
			grid-template-columns: 1fr;
			gap: 1rem;
		}
	}
</style>
