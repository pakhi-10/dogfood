<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';

	let { data, form } = $props();

	let selectedTrack = $state(
		data.project?.trackId ?? ''
	);

	const formatDateTime = (
		value: string | Date | null | undefined
	) => {
		if (!value) return 'TBA';

		return new Intl.DateTimeFormat(
			'en-IN',
			{
				dateStyle: 'medium',
				timeStyle: 'short'
			}
		).format(new Date(value));
	};
</script>

<svelte:head>
	<title>
		{data.event
			? `Submit — ${data.event.name}`
			: 'New Submission'} — DOGFOOD
	</title>
</svelte:head>

<div class="page">
	<Navbar user={data.user} />

	<main>
		<a href="/events" class="back">
			← Events
		</a>

		{#if data.error}
			<section class="error">
				{data.error}
			</section>
		{:else if data.event}
			<header class="header">
				<p class="eyebrow">
					PROJECT SUBMISSION
				</p>

				<h1>{data.event.name}</h1>

				<p>
					Complete your project details and the
					submission questions configured by the
					organizer.
				</p>

				<div class="submission-info">
					<div>
						<span class="info-label">
							TEAM
						</span>

						<strong>
							{data.team?.teamName}
						</strong>
					</div>

					<div>
						<span class="info-label">
							MEMBERS
						</span>

						<strong>
							{data.teamMemberCount}
							/
							{data.event.maxTeamSize}
						</strong>
					</div>

					<div>
						<span class="info-label">
							MINIMUM REQUIRED
						</span>

						<strong>
							{data.event.minTeamSize}
						</strong>
					</div>

					{#if data.event.submissionsClose}
						<div>
							<span class="info-label">
								SUBMISSION CLOSES
							</span>

							<strong>
								{formatDateTime(
									data.event
										.submissionsClose
								)}
							</strong>
						</div>
					{/if}
				</div>
			</header>

			{#if form?.error}
				<section class="form-error">
					{form.error}
				</section>
			{/if}

			{#if !data.submissionOpen}
				<section class="closed">
					<p class="eyebrow">
						{data.submissionClosed
							? 'SUBMISSIONS CLOSED'
							: 'SUBMISSIONS NOT OPEN'}
					</p>

					<h2>
						{data.submissionClosed
							? 'The submission deadline has passed.'
							: 'Project submissions are not open yet.'}
					</h2>

					{#if data.event.submissionsClose}
						<p>
							Submission deadline:
							<strong>
								{formatDateTime(
									data.event
										.submissionsClose
								)}
							</strong>
						</p>
					{/if}

					<a
						href={`/events/${data.event.id}`}
						class="button"
					>
						← Back to event
					</a>
				</section>
			{:else}
				{#if data.teamMemberCount < data.event.minTeamSize}
					<section class="team-warning">
						<p class="eyebrow">
							TEAM INCOMPLETE
						</p>

						<h2>
							Your team needs more members.
						</h2>

						<p>
							Your team currently has
							<strong>
								{data.teamMemberCount}
							</strong>
							member{data.teamMemberCount === 1
								? ''
								: 's'}
							but this event requires at least
							<strong>
								{data.event.minTeamSize}
							</strong>
							members to submit.
						</p>

						<a
							href={`/events/${data.event.id}/apply`}
							class="button"
						>
							Manage Team →
						</a>
					</section>
				{/if}

				<form
					method="POST"
					action="?/submit"
					class:form-disabled={
						data.teamMemberCount <
						data.event.minTeamSize
					}
					class="form"
				>
					<input
						type="hidden"
						name="eventId"
						value={data.event.id}
					/>

					<section class="section">
						<p class="eyebrow">
							01 / PROJECT
						</p>

						<div class="field">
							<label for="trackId">
								Track
							</label>

							<select
								id="trackId"
								name="trackId"
								bind:value={selectedTrack}
								required
								disabled={
									data.teamMemberCount <
									data.event.minTeamSize
								}
							>
								<option
									value=""
									disabled
								>
									Select a track
								</option>

								{#each data.tracks as track}
									<option
										value={track.id}
									>
										{track.name}
									</option>
								{/each}
							</select>
						</div>

						<div class="field">
							<label for="projectName">
								Project name
							</label>

							<input
								id="projectName"
								name="projectName"
								value={
									data.project?.title ?? ''
								}
								required
								disabled={
									data.teamMemberCount <
									data.event.minTeamSize
								}
							/>
						</div>

						<div class="field">
							<label for="projectTagline">
								Tagline
							</label>

							<input
								id="projectTagline"
								name="projectTagline"
								value={
									data.project
										?.projectTagline ?? ''
								}
								disabled={
									data.teamMemberCount <
									data.event.minTeamSize
								}
							/>
						</div>

						<div class="field">
							<label for="longDescription">
								Project description
							</label>

							<textarea
								id="longDescription"
								name="longDescription"
								rows="8"
								required
								disabled={
									data.teamMemberCount <
									data.event.minTeamSize
								}
							>{data.project?.summary ?? ''}</textarea>
						</div>

						<div class="field">
							<label for="repoUrl">
								Repository URL
							</label>

							<input
								id="repoUrl"
								name="repoUrl"
								type="url"
								value={
									data.project
										?.repoUrl ?? ''
								}
								disabled={
									data.teamMemberCount <
									data.event.minTeamSize
								}
							/>
						</div>

						<div class="field">
							<label for="demoVideoUrl">
								Demo video URL
							</label>

							<input
								id="demoVideoUrl"
								name="demoVideoUrl"
								type="url"
								value={
									data.project
										?.demoVideoUrl ?? ''
								}
								disabled={
									data.teamMemberCount <
									data.event.minTeamSize
								}
							/>
						</div>
					</section>

					{#each data.forms as submissionForm}
						{@const formQuestions =
							data.questions.filter(
								(question) =>
									question.formId ===
									submissionForm.id
							)}

						{#if formQuestions.length > 0}
							<section class="section">
								<p class="eyebrow">
									CUSTOM FORM
								</p>

								<h2>
									{submissionForm.name}
								</h2>

								<div class="questions">
									{#each formQuestions as question}
										<div class="field">
											<label
												for={`question-${question.id}`}
											>
												{question.question}

												{#if question.required}
													<span class="required">
														*
													</span>
												{/if}
											</label>

											{#if question.questionType === 'textarea'}
												<textarea
													id={`question-${question.id}`}
													name={`question_${question.id}`}
													rows="6"
													required={
														question.required
													}
													disabled={
														data.teamMemberCount <
														data.event.minTeamSize
													}
												></textarea>

											{:else if question.questionType === 'number'}
												<input
													id={`question-${question.id}`}
													name={`question_${question.id}`}
													type="number"
													required={
														question.required
													}
													disabled={
														data.teamMemberCount <
														data.event.minTeamSize
													}
												/>

											{:else if question.questionType === 'select'}
												<select
													id={`question-${question.id}`}
													name={`question_${question.id}`}
													required={
														question.required
													}
													disabled={
														data.teamMemberCount <
														data.event.minTeamSize
													}
												>
													<option
														value=""
														disabled
														selected
													>
														Select an option
													</option>

													{#each question.options ?? [] as option}
														<option
															value={option}
														>
															{option}
														</option>
													{/each}
												</select>

											{:else if question.questionType === 'radio'}
												<div class="options">
													{#each question.options ?? [] as option}
														<label class="option">
															<input
																type="radio"
																name={`question_${question.id}`}
																value={option}
																required={
																	question.required
																}
																disabled={
																	data.teamMemberCount <
																	data.event.minTeamSize
																}
															/>

															<span>
																{option}
															</span>
														</label>
													{/each}
												</div>

											{:else if question.questionType === 'checkbox'}
												<div class="options">
													{#each question.options ?? [] as option}
														<label class="option">
															<input
																type="checkbox"
																name={`question_${question.id}`}
																value={option}
																disabled={
																	data.teamMemberCount <
																	data.event.minTeamSize
																}
															/>

															<span>
																{option}
															</span>
														</label>
													{/each}
												</div>

											{:else}
												<input
													id={`question-${question.id}`}
													name={`question_${question.id}`}
													type="text"
													required={
														question.required
													}
													disabled={
														data.teamMemberCount <
														data.event.minTeamSize
													}
												/>
											{/if}
										</div>
									{/each}
								</div>
							</section>
						{/if}
					{/each}

					<div class="actions">
						<button
							type="submit"
							class="button primary"
							disabled={
								data.teamMemberCount <
								data.event.minTeamSize
							}
						>
							Submit project →
						</button>
					</div>
				</form>
			{/if}
		{/if}
	</main>
</div>

<style>
	.page {
		min-height: 100vh;
		background: #f5f4ef;
		color: #111;
	}

	main {
		width: min(
			900px,
			calc(100% - 40px)
		);
		margin: 0 auto;
		padding: 56px 0 100px;
	}

	.back {
		color: #666;
		text-decoration: none;
		font-size: 13px;
	}

	.header {
		padding: 70px 0 45px;
		border-bottom: 1px solid #111;
	}

	.eyebrow {
		margin: 0 0 12px;
		font-size: 10px;
		letter-spacing: 0.12em;
		font-weight: 700;
	}

	h1 {
		margin: 0;
		font-size: clamp(
			46px,
			8vw,
			84px
		);
		line-height: 0.9;
		letter-spacing: -0.06em;
	}

	h2 {
		margin: 0 0 28px;
		font-size: 30px;
		letter-spacing: -0.03em;
	}

	.header p:last-of-type {
		max-width: 650px;
		margin: 24px 0 0;
		color: #666;
		line-height: 1.6;
	}

	.submission-info {
		display: grid;
		grid-template-columns:
			repeat(4, minmax(0, 1fr));
		gap: 16px;
		margin-top: 40px;
		padding-top: 24px;
		border-top: 1px solid #ccc;
	}

	.submission-info > div {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.info-label {
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.12em;
		color: #777;
	}

	.submission-info strong {
		font-size: 13px;
		line-height: 1.4;
	}

	.section {
		padding: 50px 0;
		border-bottom: 1px solid #ccc;
	}

	.field {
		margin-bottom: 28px;
	}

	.field:last-child {
		margin-bottom: 0;
	}

	.field > label {
		display: block;
		margin-bottom: 9px;
		font-size: 12px;
		font-weight: 700;
	}

	input,
	textarea,
	select {
		width: 100%;
		box-sizing: border-box;
		padding: 14px;
		border: 1px solid #999;
		background: transparent;
		color: #111;
		font: inherit;
	}

	input:disabled,
	textarea:disabled,
	select:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}

	textarea {
		resize: vertical;
	}

	.required {
		color: #b00020;
	}

	.options {
		display: grid;
		gap: 10px;
	}

	.option {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px;
		border: 1px solid #ccc;
		cursor: pointer;
	}

	.option input {
		width: auto;
	}

	.actions {
		padding-top: 36px;
	}

	.button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 48px;
		padding: 0 22px;
		border: 1px solid #111;
		background: transparent;
		color: #111;
		font: inherit;
		font-size: 13px;
		font-weight: 700;
		cursor: pointer;
		text-decoration: none;
	}

	.button.primary {
		background: #111;
		color: white;
	}

	.button:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}

	.error,
	.form-error,
	.closed,
	.team-warning {
		margin-top: 40px;
		padding: 24px;
		border: 1px solid #b00020;
	}

	.form-error {
		color: #b00020;
	}

	.closed h2,
	.team-warning h2 {
		margin: 0 0 12px;
		font-size: 30px;
		letter-spacing: -0.03em;
	}

	.closed p,
	.team-warning p {
		color: #666;
		line-height: 1.6;
	}

	.closed .button,
	.team-warning .button {
		margin-top: 20px;
	}

	.team-warning {
		border-color: #999;
	}

	.team-warning .eyebrow {
		color: #666;
	}

	.form-disabled {
		opacity: 0.7;
	}

	@media (max-width: 700px) {
		.submission-info {
			grid-template-columns:
				repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 480px) {
		main {
			width: min(
				100% - 28px,
				900px
			);
			padding-top: 32px;
		}

		.header {
			padding-top: 50px;
		}

		.submission-info {
			grid-template-columns: 1fr;
		}
	}
</style>