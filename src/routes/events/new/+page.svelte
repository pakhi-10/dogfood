<svelte:head>
	<title>New Event — DOGFOOD</title>
</svelte:head>

<div class="page">
	<header>
		<a href="/">← DOGFOOD</a>
		<span>NEW EVENT</span>
	</header>

	<main>
		<p class="eyebrow">ORGANIZER</p>

		<h1>Create<br />an event.</h1>

		{#if form?.error}
			<div class="error">{form.error}</div>
		{/if}

		<form method="POST">
			<section>
				<h2>Basics</h2>

				<label>
					Event name
					<input name="name" required maxlength="200" />
				</label>

				<label>
					Tagline
					<input name="tagline" maxlength="500" />
				</label>

				<label>
					About
					<textarea name="about" rows="6"></textarea>
				</label>

				<label>
					Prizes
					<textarea name="prizes" rows="4"></textarea>
				</label>
			</section>

			<section>
				<h2>Teams</h2>

				<div class="two">
					<label>
						Minimum team size
						<input
							name="minTeamSize"
							type="number"
							min="1"
							value="1"
							required
						/>
					</label>

					<label>
						Maximum team size
						<input
							name="maxTeamSize"
							type="number"
							min="1"
							value="4"
							required
						/>
					</label>
				</div>
			</section>

			<section>
				<h2>Dates</h2>

				<label>
					Application opens
					<input
						name="applicationOpenAt"
						type="datetime-local"
					/>
				</label>

				<label>
					Application closes
					<input
						name="applicationCloseAt"
						type="datetime-local"
					/>
				</label>

				<label>
					Submission deadline
					<input
						name="submissionDeadline"
						type="datetime-local"
						required
					/>
				</label>
			</section>

			<section>
				<h2>Tracks</h2>

				<p>
					Enter one track per line.
				</p>

				<textarea
					name="tracks"
					rows="6"
					placeholder="General&#10;AI/ML&#10;Web"
					required
				></textarea>
			</section>

			<button type="submit">
				Create event →
			</button>
		</form>
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
		max-width: 900px;
		margin: 0 auto;
		padding: 5rem 2rem;
	}

	.eyebrow {
		font-weight: 900;
		letter-spacing: 0.12em;
		font-size: 0.75rem;
	}

	h1 {
		font-size: clamp(4rem, 11vw, 8rem);
		line-height: 0.82;
		margin: 1rem 0 5rem;
	}

	form {
		display: grid;
		gap: 4rem;
	}

	section {
		border-top: 2px solid #111;
		padding-top: 1.5rem;
	}

	h2 {
		margin-bottom: 2rem;
		font-size: 2rem;
	}

	label {
		display: grid;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
		font-weight: 900;
	}

	input,
	textarea {
		width: 100%;
		box-sizing: border-box;
		border: 2px solid #111;
		background: #fff;
		padding: 0.9rem;
		font: inherit;
	}

	.two {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	button {
		border: 2px solid #111;
		background: #111;
		color: #f3f0e8;
		padding: 1.25rem;
		font: inherit;
		font-weight: 900;
		cursor: pointer;
	}

	.error {
		border: 2px solid #111;
		padding: 1rem;
		background: #e8b9a9;
		margin-bottom: 2rem;
		font-weight: 900;
	}

	@media (max-width: 650px) {
		.two {
			grid-template-columns: 1fr;
		}
	}
</style>