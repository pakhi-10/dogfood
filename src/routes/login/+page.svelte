<svelte:head>
	<title>Log in — DOGFOOD</title>
</svelte:head>

<div class="page">
	<a href="/" class="back">← DOGFOOD</a>

	<div class="auth-card">
		<p class="eyebrow">AUTHENTICATION</p>

		<h1>Log in.</h1>

		{#if form?.error}
			<div class="error">{form.error}</div>
		{/if}

		<form method="POST">
			<label>
				Email
				<input
					name="email"
					type="email"
					required
					autocomplete="email"
				/>
			</label>

			<label>
				Password
				<input
					name="password"
					type="password"
					required
					autocomplete="current-password"
				/>
			</label>

			<button type="submit">Log in →</button>
		</form>

		<p class="switch">
			No account?
			<a href="/signup">Create one</a>
		</p>
	</div>
</div>

<style>
	.page {
		min-height: 100vh;
		background: #f3f0e8;
		color: #111;
		padding: 2rem;
	}

	.back {
		color: inherit;
		text-decoration: none;
		font-weight: 800;
	}

	.auth-card {
		max-width: 560px;
		margin: 10rem auto;
	}

	.eyebrow {
		font-size: 0.75rem;
		font-weight: 900;
		letter-spacing: 0.12em;
	}

	h1 {
		font-size: clamp(4rem, 10vw, 7rem);
		line-height: 0.85;
		margin: 1rem 0 2rem;
	}

	form {
		display: grid;
		gap: 1.25rem;
	}

	label {
		display: grid;
		gap: 0.5rem;
		font-weight: 800;
	}

	input {
		border: 2px solid #111;
		background: white;
		padding: 0.9rem;
		font: inherit;
	}

	button {
		border: 2px solid #111;
		background: #111;
		color: #f3f0e8;
		padding: 1rem;
		font: inherit;
		font-weight: 900;
		cursor: pointer;
	}

	.error {
		border: 2px solid #111;
		background: #e8b9a9;
		padding: 1rem;
		margin-bottom: 1.5rem;
		font-weight: 800;
	}

	.switch {
		margin-top: 2rem;
	}

	.switch a {
		font-weight: 900;
		color: inherit;
	}
</style>