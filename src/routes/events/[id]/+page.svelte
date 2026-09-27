<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let activeTab = $state<'event-details' | 'team-formation' | 'submission'>(
		'event-details'
	);

	const tabs = [
		{
			id: 'event-details',
			number: '01',
			label: 'Event Details'
		},
		{
			id: 'team-formation',
			number: '02',
			label: 'Team Formation'
		},
		{
			id: 'submission',
			number: '03',
			label: 'Submission'
		}
	] as const;
</script>

<svelte:head>
	<title>{data.event.name || 'Event Setup'} — DOGFOOD</title>
</svelte:head>

<div class="page">
	<header class="header">
		<div>
			<a href="/events/my-events" class="back-link">
				← Back to My Events
			</a>

			<p class="eyebrow">EVENT SETUP</p>

			<h1>{data.event.name || 'Untitled event'}</h1>

			<p class="status {data.event.status}">
				{data.event.status === 'live' ? 'LIVE' : 'DRAFT'}
			</p>
		</div>
	</header>

	<nav class="tabs">
		{#each tabs as tab}
			<button
				type="button"
				class:active={activeTab === tab.id}
				onclick={() => (activeTab = tab.id)}
			>
				<span>{tab.number}</span>
				{tab.label}
			</button>
		{/each}
	</nav>

	{#if activeTab === 'event-details'}
		<section class="section">
			<div class="section-heading">
				<div>
					<p class="section-number">01</p>
					<h2>Event details.</h2>
					<p>
						Configure the basic information participants will see about
						your event.
					</p>
				</div>
			</div>

			<form method="POST" action="?/saveEvent" class="form">
				<div class="field">
					<label for="name">Event name</label>
					<input
						id="name"
						name="name"
						value={data.event.name ?? ''}
						required
					/>
				</div>

				<div class="field">
					<label for="tagline">Tagline</label>
					<input
						id="tagline"
						name="tagline"
						value={data.event.tagline ?? ''}
						required
					/>
				</div>

				<div class="field full">
					<label for="about">About</label>
					<textarea
						id="about"
						name="about"
						rows="6"
						required
					>{data.event.about ?? ''}</textarea>
				</div>

				<div class="field">
					<label for="logo">Logo URL</label>
					<input
						id="logo"
						name="logo"
						type="url"
						value={data.event.logo ?? ''}
					/>
				</div>

				<div class="field">
					<label for="websiteLink">Website</label>
					<input
						id="websiteLink"
						name="websiteLink"
						type="url"
						value={data.event.websiteLink ?? ''}
					/>
				</div>

				<div class="field">
					<label for="contactEmail">Contact email</label>
					<input
						id="contactEmail"
						name="contactEmail"
						type="email"
						value={data.event.contactEmail ?? ''}
						required
					/>
				</div>

				<div class="field">
					<label for="prizes">Prizes</label>
					<textarea
						id="prizes"
						name="prizes"
						rows="4"
					>{data.event.prizes ?? ''}</textarea>
				</div>

				<div class="field">
					<label for="minTeamSize">Minimum team size</label>
					<input
						id="minTeamSize"
						name="minTeamSize"
						type="number"
						min="1"
						value={data.event.minTeamSize}
						required
					/>
				</div>

				<div class="field">
					<label for="maxTeamSize">Maximum team size</label>
					<input
						id="maxTeamSize"
						name="maxTeamSize"
						type="number"
						min="1"
						value={data.event.maxTeamSize}
						required
					/>
				</div>

				<div class="field">
					<label for="applicationOpenAt">Applications open</label>
					<input
						id="applicationOpenAt"
						name="applicationOpenAt"
						type="datetime-local"
						value={data.event.applicationOpenAt
							? new Date(data.event.applicationOpenAt)
									.toISOString()
									.slice(0, 16)
							: ''}
					/>
				</div>

				<div class="field">
					<label for="applicationCloseAt">Applications close</label>
					<input
						id="applicationCloseAt"
						name="applicationCloseAt"
						type="datetime-local"
						value={data.event.applicationCloseAt
							? new Date(data.event.applicationCloseAt)
									.toISOString()
									.slice(0, 16)
							: ''}
					/>
				</div>

				<div class="field">
					<label for="judgingStartAt">Judging starts</label>
					<input
						id="judgingStartAt"
						name="judgingStartAt"
						type="datetime-local"
						value={data.event.judgingStartAt
							? new Date(data.event.judgingStartAt)
									.toISOString()
									.slice(0, 16)
							: ''}
					/>
				</div>

				<div class="field">
					<label for="judgingDeadline">Judging deadline</label>
					<input
						id="judgingDeadline"
						name="judgingDeadline"
						type="datetime-local"
						value={data.event.judgingDeadline
							? new Date(data.event.judgingDeadline)
									.toISOString()
									.slice(0, 16)
							: ''}
					/>
				</div>

				<div class="field">
					<label for="resultAnnouncement">Result announcement</label>
					<input
						id="resultAnnouncement"
						name="resultAnnouncement"
						type="datetime-local"
						value={data.event.resultAnnouncement
							? new Date(data.event.resultAnnouncement)
									.toISOString()
									.slice(0, 16)
							: ''}
					/>
				</div>

				<div class="form-actions">
					<button type="submit" class="button primary">
						Save Event Details
					</button>

					<button
						type="button"
						class="button"
						onclick={() => (activeTab = 'team-formation')}
					>
						Next →
					</button>
				</div>
			</form>
		</section>
	{:else if activeTab === 'team-formation'}
		<section class="section">
			<div class="section-heading">
				<div>
					<p class="section-number">02</p>
					<h2>Team formation.</h2>
					<p>
						Define how many participants can be part of a team.
						Actual teams and invitations are created by participants
						after the event is live.
					</p>
				</div>
			</div>

			<form method="POST" action="?/saveTeamFormation" class="form narrow">
				<div class="field">
					<label for="teamMin">Minimum team size</label>
					<input
						id="teamMin"
						name="minTeamSize"
						type="number"
						min="1"
						value={data.event.minTeamSize}
						required
					/>
				</div>

				<div class="field">
					<label for="teamMax">Maximum team size</label>
					<input
						id="teamMax"
						name="maxTeamSize"
						type="number"
						min="1"
						value={data.event.maxTeamSize}
						required
					/>
				</div>

				<div class="info-box">
					<strong>How team formation works</strong>
					<p>
						The organizer only defines the allowed team size here.
						Participants will later create teams, add members, and
						send invitations.
					</p>
				</div>

				<div class="form-actions">
					<button
						type="button"
						class="button"
						onclick={() => (activeTab = 'event-details')}
					>
						← Previous
					</button>

					<button type="submit" class="button primary">
						Save Team Configuration
					</button>

					<button
						type="button"
						class="button"
						onclick={() => (activeTab = 'submission')}
					>
						Next →
					</button>
				</div>
			</form>
		</section>
	{:else}
		<section class="section">
			<div class="section-heading">
				<div>
					<p class="section-number">03</p>
					<h2>Submission.</h2>
					<p>
						Configure tracks, stages, submission forms, and custom
						questions.
					</p>
				</div>
			</div>

			<div class="subsection">
				<div class="subsection-heading">
					<div>
						<p class="mini-label">TRACKS</p>
						<h3>Tracks</h3>
					</div>
				</div>

				<div class="items">
					{#if data.tracks.length === 0}
						<p class="muted">No tracks added yet.</p>
					{:else}
						{#each data.tracks as track}
							<div class="item">
								<div>
									<strong>{track.name}</strong>
								</div>

								<form method="POST" action="?/deleteTrack">
									<input type="hidden" name="trackId" value={track.id} />
									<button type="submit" class="delete-button">
										Delete
									</button>
								</form>
							</div>
						{/each}
					{/if}
				</div>

				<form method="POST" action="?/addTrack" class="inline-form">
					<input
						name="name"
						placeholder="Track name"
						required
					/>

					<button type="submit" class="button">
						+ Add track
					</button>
				</form>
			</div>

			<div class="subsection">
				<div class="subsection-heading">
					<div>
						<p class="mini-label">STAGES</p>
						<h3>Stages</h3>
					</div>
				</div>

				<div class="items">
					{#if data.stages.length === 0}
						<p class="muted">
							No stages added yet.
						</p>
					{:else}
						{#each data.stages as stage}
							<div class="item">
								<div>
									<strong>{stage.name}</strong>
									<span>{stage.trackName}</span>
								</div>

								<form method="POST" action="?/deleteStage">
									<input type="hidden" name="stageId" value={stage.id} />
									<button type="submit" class="delete-button">
										Delete
									</button>
								</form>
							</div>
						{/each}
					{/if}
				</div>

				<form method="POST" action="?/addStage" class="stage-form">
					<div class="field">
						<label for="stageName">Stage name</label>
						<input
							id="stageName"
							name="name"
							placeholder="e.g. Initial submission"
							required
						/>
					</div>

					<div class="field">
						<label for="stageTrack">Track</label>
						<select id="stageTrack" name="trackId" required>
							<option value="">Select track</option>

							{#each data.tracks as track}
								<option value={track.id}>
									{track.name}
								</option>
							{/each}
						</select>
					</div>

					<div class="field">
						<label for="formName">Submission form name</label>
						<input
							id="formName"
							name="formName"
							placeholder="e.g. Project Submission"
							required
						/>
					</div>

					<button type="submit" class="button">
						+ Add stage
					</button>
				</form>
			</div>

			<div class="subsection">
				<div class="subsection-heading">
					<div>
						<p class="mini-label">CUSTOM QUESTIONS</p>
						<h3>Submission questions</h3>
					</div>
				</div>

				<div class="items">
					{#if data.questions.length === 0}
						<p class="muted">
							No custom questions added yet.
						</p>
					{:else}
						{#each data.questions as question}
							<div class="item">
								<div>
									<strong>{question.question}</strong>

									<span>
										{question.formName}
										·
										{question.questionType}
										{question.required ? ' · Required' : ''}
									</span>
								</div>

								<form method="POST" action="?/deleteQuestion">
									<input
										type="hidden"
										name="questionId"
										value={question.id}
									/>

									<button type="submit" class="delete-button">
										Delete
									</button>
								</form>
							</div>
						{/each}
					{/if}
				</div>

				{#if data.forms.length > 0}
					<form method="POST" action="?/addQuestion" class="question-form">
						<div class="field">
							<label for="questionForm">Submission form</label>

							<select id="questionForm" name="formId" required>
								<option value="">Select form</option>

								{#each data.forms as form}
									<option value={form.id}>
										{form.name}
									</option>
								{/each}
							</select>
						</div>

						<div class="field">
							<label for="question">Question</label>

							<input
								id="question"
								name="question"
								placeholder="e.g. Describe your project"
								required
							/>
						</div>

						<div class="field">
							<label for="questionType">Question type</label>

							<select id="questionType" name="questionType" required>
								<option value="text">Text</option>
								<option value="textarea">Long text</option>
								<option value="number">Number</option>
								<option value="select">Select</option>
								<option value="radio">Radio</option>
								<option value="checkbox">Checkbox</option>
							</select>
						</div>

						<div class="field">
							<label for="options">
								Options
							</label>

							<input
								id="options"
								name="options"
								placeholder="Option 1, Option 2, Option 3"
							/>
						</div>

						<label class="checkbox-field">
							<input
								type="checkbox"
								name="required"
								value="true"
							/>
							<span>Required question</span>
						</label>

						<button type="submit" class="button">
							+ Add question
						</button>
					</form>
				{:else}
					<div class="info-box">
						<strong>Create a stage first.</strong>
						<p>
							Submission questions are attached to submission forms.
							Add a stage above to create its submission form.
						</p>
					</div>
				{/if}
			</div>

			<div class="bottom-actions">
				<button
					type="button"
					class="button"
					onclick={() => (activeTab = 'team-formation')}
				>
					← Previous
				</button>

				<form method="POST" action="?/makeLive">
					<button type="submit" class="button primary">
						Make event live →
					</button>
				</form>
			</div>
		</section>
	{/if}
</div>

<style>
	:global(body) {
		margin: 0;
		background: #f3f0e8;
		color: #111;
		font-family:
			Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
			"Segoe UI", sans-serif;
	}

	.page {
		max-width: 1200px;
		margin: 0 auto;
		padding: 56px 32px 100px;
	}

	.header {
		margin-bottom: 48px;
	}

	.back-link {
		display: inline-block;
		margin-bottom: 40px;
		color: #111;
		font-size: 14px;
		font-weight: 700;
	}

	.eyebrow {
		margin: 0 0 12px;
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.12em;
	}

	h1 {
		margin: 0 0 20px;
		font-size: clamp(48px, 8vw, 96px);
		line-height: 0.9;
		letter-spacing: -0.06em;
	}

	.status {
		display: inline-block;
		margin: 0;
		padding: 6px 9px;
		border: 1px solid #111;
		font-size: 11px;
		font-weight: 800;
		letter-spacing: 0.08em;
	}

	.status.live {
		background: #111;
		color: #f3f0e8;
	}

	.tabs {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		border: 2px solid #111;
		margin-bottom: 48px;
	}

	.tabs button {
		border: 0;
		border-right: 2px solid #111;
		background: transparent;
		padding: 20px;
		text-align: left;
		font: inherit;
		font-weight: 700;
		cursor: pointer;
	}

	.tabs button:last-child {
		border-right: 0;
	}

	.tabs button.active {
		background: #111;
		color: #f3f0e8;
	}

	.tabs span {
		margin-right: 12px;
		font-size: 12px;
	}

	.section-heading {
		padding-bottom: 32px;
		border-bottom: 2px solid #111;
		margin-bottom: 32px;
	}

	.section-number,
	.mini-label {
		margin: 0 0 10px;
		font-size: 11px;
		font-weight: 800;
		letter-spacing: 0.1em;
	}

	h2 {
		margin: 0;
		font-size: 48px;
		letter-spacing: -0.04em;
	}

	.section-heading p:last-child {
		max-width: 650px;
		line-height: 1.6;
	}

	.form {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 24px;
	}

	.form.narrow {
		max-width: 700px;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.field.full {
		grid-column: 1 / -1;
	}

	.field label {
		font-size: 12px;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	input,
	textarea,
	select {
		box-sizing: border-box;
		width: 100%;
		border: 2px solid #111;
		border-radius: 0;
		background: transparent;
		color: #111;
		padding: 13px 14px;
		font: inherit;
	}

	textarea {
		resize: vertical;
	}

	.form-actions,
	.bottom-actions {
		grid-column: 1 / -1;
		display: flex;
		gap: 12px;
		align-items: center;
		margin-top: 12px;
	}

	.bottom-actions {
		justify-content: space-between;
		border-top: 2px solid #111;
		padding-top: 24px;
	}

	.button {
		border: 2px solid #111;
		background: transparent;
		color: #111;
		padding: 13px 18px;
		font: inherit;
		font-weight: 700;
		cursor: pointer;
	}

	.button.primary {
		background: #111;
		color: #f3f0e8;
	}

	.button:hover {
		transform: translateY(-1px);
	}

	.info-box {
		grid-column: 1 / -1;
		border: 2px solid #111;
		padding: 20px;
	}

	.info-box strong {
		display: block;
		margin-bottom: 8px;
	}

	.info-box p {
		margin: 0;
		line-height: 1.6;
	}

	.subsection {
		border-top: 2px solid #111;
		padding: 32px 0;
	}

	.subsection-heading {
		margin-bottom: 24px;
	}

	h3 {
		margin: 0;
		font-size: 30px;
		letter-spacing: -0.03em;
	}

	.items {
		display: flex;
		flex-direction: column;
		margin-bottom: 20px;
	}

	.item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 20px;
		border-bottom: 1px solid #111;
		padding: 16px 0;
	}

	.item div {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.item span {
		font-size: 13px;
	}

	.delete-button {
		border: 0;
		background: transparent;
		color: #111;
		font: inherit;
		font-size: 13px;
		font-weight: 700;
		cursor: pointer;
		text-decoration: underline;
	}

	.inline-form,
	.stage-form,
	.question-form {
		display: grid;
		gap: 16px;
	}

	.inline-form {
		grid-template-columns: 1fr auto;
	}

	.stage-form,
	.question-form {
		grid-template-columns: repeat(2, 1fr);
	}

	.stage-form > .button,
	.question-form > .button {
		align-self: end;
		justify-self: start;
	}

	.checkbox-field {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 14px;
	}

	.checkbox-field input {
		width: auto;
	}

	.muted {
		opacity: 0.65;
	}

	@media (max-width: 800px) {
		.page {
			padding: 40px 20px 72px;
		}

		.tabs {
			grid-template-columns: 1fr;
		}

		.tabs button {
			border-right: 0;
			border-bottom: 2px solid #111;
		}

		.tabs button:last-child {
			border-bottom: 0;
		}

		.form,
		.stage-form,
		.question-form {
			grid-template-columns: 1fr;
		}

		.field.full {
			grid-column: auto;
		}
	}

	@media (max-width: 560px) {
		h2 {
			font-size: 38px;
		}

		.inline-form {
			grid-template-columns: 1fr;
		}

		.form-actions,
		.bottom-actions {
			align-items: stretch;
			flex-direction: column;
		}

		.form-actions .button,
		.bottom-actions .button,
		.bottom-actions form {
			width: 100%;
		}

		.bottom-actions form .button {
			width: 100%;
		}
	}
</style>

