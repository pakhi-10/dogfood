<script lang="ts">
	let { form } = $props();
</script>

<svelte:head>
	<title>Sign up — DOGFOOD</title>
</svelte:head>

<div class="page">
	<a href="/" class="back">← DOGFOOD</a>

	<div class="auth-card">
		<p class="eyebrow">CREATE ACCOUNT</p>

		<h1>Join DOGFOOD.</h1>

		<p class="intro">
			Create a participant account to register for events,
			form teams and submit projects.
		</p>

		{#if form?.error}
			<div class="error">{form.error}</div>
		{/if}

		<form method="POST">
			<label>
				Name
				<input
					name="name"
					type="text"
					required
					autocomplete="name"
				/>
			</label>

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
					minlength="8"
					autocomplete="new-password"
				/>
			</label>

			<button type="submit">Create account →</button>
		</form>

		<p class="switch">
			Already have an account?
			<a href="/login">Log in</a>
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
		margin: 8rem auto;
	}

	.eyebrow {
		font-size: 0.75rem;
		font-weight: 900;
		letter-spacing: 0.12em;
	}

	h1 {
		font-size: clamp(3rem, 8vw, 6rem);
		line-height: 0.9;
		margin: 1rem 0;
	}

	.intro {
		max-width: 42rem;
		font-size: 1.1rem;
		line-height: 1.5;
		margin-bottom: 2rem;
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
		background: #fff;
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