<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	let { data }: { data: PageData } = $props();

	let activeTab = $state<
		'event-details' | 'team-formation' | 'submission'
	>('event-details');

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

	/*
	 * PostgreSQL stores these values as timestamps with timezone.
	 *
	 * datetime-local inputs, however, contain NO timezone.
	 *
	 * This helper converts a stored timestamp into the
	 * user's LOCAL date/time so that the datetime-local
	 * input shows exactly the clock time the user selected.
	 */
	function toDateTimeLocal(
		date: string | Date | null | undefined
	) {
		if (!date) {
			return '';
		}

		const d = new Date(date);

		if (Number.isNaN(d.getTime())) {
			return '';
		}

		const pad = (n: number) =>
			String(n).padStart(2, '0');

		return `${d.getFullYear()}-${pad(
			d.getMonth() + 1
		)}-${pad(d.getDate())}T${pad(
			d.getHours()
		)}:${pad(d.getMinutes())}`;
	}

	/*
	 * Convert every datetime-local value into an ISO
	 * timestamp before sending the form to the server.
	 *
	 * Example:
	 *
	 * User selects:
	 * 28 Sep 2026, 6:30 PM
	 *
	 * Browser interprets that as:
	 * 28 Sep 2026, 6:30 PM in the user's local timezone
	 *
	 * It is then sent as an unambiguous UTC ISO timestamp.
	 */
	function prepareEventDates(
		formData: FormData
	) {
		const dateFields = [
			'applicationOpenAt',
			'applicationCloseAt',
			'submissionsClose',
			'judgingStartAt',
			'judgingDeadline',
			'resultAnnouncement'
		];

		for (const name of dateFields) {
			const value = formData.get(name);

			if (
				value === null ||
				String(value).trim() === ''
			) {
				formData.set(name, '');
				continue;
			}

			const localValue = String(value);
			const date = new Date(localValue);

			if (!Number.isNaN(date.getTime())) {
				formData.set(
					name,
					date.toISOString()
				);
			}
		}
	}
</script>

<svelte:head>
	<title>
		{data.event.name || 'Event Setup'} — DOGFOOD
	</title>
</svelte:head>

{#if data.view === 'participant'}

	<!-- ================================================= -->
	<!-- PARTICIPANT VIEW                                 -->
	<!-- ================================================= -->

	<div class="participant-page">

		<header class="participant-header">

			<div class="participant-heading">

				<a
					href="/events"
					class="participant-back"
				>
					← Back to events
				</a>

				<p class="participant-label">
					LIVE EVENT
				</p>

				<h1>{data.event.name}</h1>

				{#if data.event.tagline}
					<p class="participant-tagline">
						{data.event.tagline}
					</p>
				{/if}

			</div>

			{#if data.alreadyApplied}

				<a
					class="apply-button"
					href={`/events/${data.event.id}/apply`}
				>
					Edit Application →
				</a>

			{:else if data.applicationNotOpenYet}

				<div class="application-status">
					<span>
						APPLICATIONS NOT OPEN
					</span>
				</div>

			{:else if data.applicationOpen}

				<a
					class="apply-button"
					href={`/events/${data.event.id}/apply`}
				>
					Apply to Event →
				</a>

			{:else}

				{#if data.submissionOpen}

					<a
						class="apply-button"
						href={`/projects/new?eventId=${data.event.id}`}
					>
						Submit Project →
					</a>

				{:else if data.submissionClosed}

					<div class="application-status">
						<span>
							SUBMISSIONS CLOSED
						</span>
					</div>

				{:else}

					<div class="application-status">
						<span>
							APPLICATIONS CLOSED
						</span>
					</div>

				{/if}

			{/if}

		</header>


		<main class="participant-content">

			<!-- ABOUT -->

			<section class="participant-section">

				<p class="section-label">
					01 / ABOUT
				</p>

				<h2>About the event.</h2>

				{#if data.event.about}
					<p class="event-description">
						{data.event.about}
					</p>
				{:else}
					<p class="muted">
						No description provided.
					</p>
				{/if}

			</section>


			<!-- TEAM FORMATION -->

			<section class="participant-section">

				<p class="section-label">
					02 / TEAM FORMATION
				</p>

				<h2>Build your team.</h2>

				<div class="team-size-grid">

					<div class="team-size-card">
						<span>MINIMUM</span>

						<strong>
							{data.event.minTeamSize}
						</strong>

						<p>
							participant{data.event.minTeamSize === 1
								? ''
								: 's'}
						</p>
					</div>

					<div class="team-size-card">
						<span>MAXIMUM</span>

						<strong>
							{data.event.maxTeamSize}
						</strong>

						<p>
							participants
						</p>
					</div>

				</div>

				{#if data.alreadyApplied && data.team}

					<div class="application-card">

						<div>
							<span>
								YOUR APPLICATION
							</span>

							<strong>
								{data.team.name}
							</strong>

							<p>
								{data.team.isLeader
									? 'You are the team leader.'
									: `Team leader: ${data.team.leaderEmail}`}
							</p>
						</div>

						<div class="application-complete">
							APPLICATION COMPLETE
						</div>

					</div>

				{/if}

			</section>


			<!-- TRACKS -->

			{#if data.tracks.length > 0}

				<section class="participant-section">

					<p class="section-label">
						03 / TRACKS
					</p>

					<h2>
						Choose your direction.
					</h2>

					<div class="tracks-grid">

						{#each data.tracks as track}

							<div class="track-card">

								<h3>
									{track.name}
								</h3>

								{#if track.description}
									<p>
										{track.description}
									</p>
								{:else}
									<p class="muted">
										No description provided.
									</p>
								{/if}

							</div>

						{/each}

					</div>

				</section>

			{/if}


			<!-- DATES -->

			<section class="participant-section">

				<p class="section-label">
					04 / TIMELINE
				</p>

				<h2>
					Important dates.
				</h2>

				<div class="dates-grid">

					{#if data.event.applicationOpenAt}

						<div class="date-item">

							<span>
								Applications open
							</span>

							<strong>
								{new Date(
									data.event.applicationOpenAt
								).toLocaleString(
									'en-IN'
								)}
							</strong>

						</div>

					{/if}


					{#if data.event.applicationCloseAt}

						<div class="date-item">

							<span>
								Applications close
							</span>

							<strong>
								{new Date(
									data.event.applicationCloseAt
								).toLocaleString(
									'en-IN'
								)}
							</strong>

						</div>

					{/if}


					{#if data.event.submissionsClose}

						<div class="date-item">

							<span>
								Submissions close
							</span>

							<strong>
								{new Date(
									data.event.submissionsClose
								).toLocaleString(
									'en-IN'
								)}
							</strong>

						</div>

					{/if}


					{#if data.event.judgingStartAt}

						<div class="date-item">

							<span>
								Judging starts
							</span>

							<strong>
								{new Date(
									data.event.judgingStartAt
								).toLocaleString(
									'en-IN'
								)}
							</strong>

						</div>

					{/if}


					{#if data.event.judgingDeadline}

						<div class="date-item">

							<span>
								Judging deadline
							</span>

							<strong>
								{new Date(
									data.event.judgingDeadline
								).toLocaleString(
									'en-IN'
								)}
							</strong>

						</div>

					{/if}


					{#if data.event.resultAnnouncement}

						<div class="date-item">

							<span>
								Results
							</span>

							<strong>
								{new Date(
									data.event.resultAnnouncement
								).toLocaleString(
									'en-IN'
								)}
							</strong>

						</div>

					{/if}

				</div>

			</section>


			<!-- PRIZES -->

			{#if data.event.prizes}

				<section class="participant-section">

					<p class="section-label">
						05 / PRIZES
					</p>

					<h2>
						Prizes.
					</h2>

					<p class="event-description">
						{data.event.prizes}
					</p>

				</section>

			{/if}


			<!-- PARTICIPANT ACTION -->

			<section class="participant-apply">

				<div>

					{#if data.alreadyApplied}

						<p class="section-label">
							APPLICATION
						</p>

						<h2>
							Your application.
						</h2>

						<p>
							Your team application has been
							created.
						</p>

					{:else if data.applicationOpen}

						<p class="section-label">
							READY?
						</p>

						<h2>
							Join this event.
						</h2>

						<p>
							Create your team and complete
							the application.
						</p>

					{:else if data.submissionOpen}

						<p class="section-label">
							SUBMISSIONS OPEN
						</p>

						<h2>
							Submit your project.
						</h2>

						<p>
							Complete your project submission
							before the deadline.
						</p>

					{:else}

						<p class="section-label">
							EVENT
						</p>

						<h2>
							Applications closed.
						</h2>

						<p>
							The application period for this
							event has ended.
						</p>

					{/if}

				</div>


				{#if data.alreadyApplied}

					{#if data.applicationOpen}

						<a
							class="apply-button apply-button-light"
							href={`/events/${data.event.id}/apply`}
						>
							Edit Application →
						</a>

					{:else if data.submissionOpen}

						<a
							class="apply-button apply-button-light"
							href={`/projects/new?eventId=${data.event.id}`}
						>
							Submit Project →
						</a>

					{/if}

				{:else if data.applicationOpen}

					<a
						class="apply-button apply-button-light"
						href={`/events/${data.event.id}/apply`}
					>
						Apply to Event →
					</a>

				{/if}

			</section>

		</main>

	</div>


{:else}

	<!-- ================================================= -->
	<!-- ORGANIZER VIEW                                   -->
	<!-- ================================================= -->

	<div class="page">

		<header class="header">

			<div>

				<a
					href="/events/my-events"
					class="back-link"
				>
					← Back to My Events
				</a>

				<p class="eyebrow">
					EVENT SETUP
				</p>

				<h1>
					{data.event.name ||
						'Untitled event'}
				</h1>

				<p
					class="status {data.event.status}"
				>
					{data.event.status === 'live'
						? 'LIVE'
						: 'DRAFT'}
				</p>

			</div>

		</header>


		<nav class="tabs">

			{#each tabs as tab}

				<button
					type="button"
					class:active={
						activeTab === tab.id
					}
					onclick={() =>
						(activeTab = tab.id)}
				>
					<span>
						{tab.number}
					</span>

					{tab.label}
				</button>

			{/each}

		</nav>


		<!-- ================================================= -->
		<!-- EVENT DETAILS                                    -->
		<!-- ================================================= -->

		{#if activeTab === 'event-details'}

			<section class="section">

				<div class="section-heading">

					<div>

						<p class="section-number">
							01
						</p>

						<h2>
							Event details.
						</h2>

						<p>
							Configure the basic information
							participants will see about your
							event.
						</p>

					</div>

				</div>


				<form
					method="POST"
					action="?/saveEvent"
					class="form"
					use:enhance={({
						formData
					}) => {
						prepareEventDates(
							formData
						);
					}}
				>

					<div class="field">

						<label for="name">
							Event name
						</label>

						<input
							id="name"
							name="name"
							value={
								data.event.name ??
								''
							}
							required
						/>

					</div>


					<div class="field">

						<label for="tagline">
							Tagline
						</label>

						<input
							id="tagline"
							name="tagline"
							value={
								data.event
									.tagline ??
								''
							}
							required
						/>

					</div>


					<div class="field full">

						<label for="about">
							About
						</label>

						<textarea
							id="about"
							name="about"
							rows="6"
							required
						>{data.event.about ??
							''}</textarea>

					</div>


					<div class="field">

						<label for="logo">
							Logo URL
						</label>

						<input
							id="logo"
							name="logo"
							type="url"
							value={
								data.event.logo ??
								''
							}
						/>

					</div>


					<div class="field">

						<label for="websiteLink">
							Website
						</label>

						<input
							id="websiteLink"
							name="websiteLink"
							type="url"
							value={
								data.event
									.websiteLink ??
								''
							}
						/>

					</div>


					<div class="field">

						<label for="contactEmail">
							Contact email
						</label>

						<input
							id="contactEmail"
							name="contactEmail"
							type="email"
							value={
								data.event
									.contactEmail ??
								''
							}
							required
						/>

					</div>


					<div class="field">

						<label for="prizes">
							Prizes
						</label>

						<textarea
							id="prizes"
							name="prizes"
							rows="4"
						>{data.event.prizes ??
							''}</textarea>

					</div>


					<div class="field">

						<label for="minTeamSize">
							Minimum team size
						</label>

						<input
							id="minTeamSize"
							name="minTeamSize"
							type="number"
							min="1"
							value={
								data.event
									.minTeamSize
							}
							required
						/>

					</div>


					<div class="field">

						<label for="maxTeamSize">
							Maximum team size
						</label>

						<input
							id="maxTeamSize"
							name="maxTeamSize"
							type="number"
							min="1"
							value={
								data.event
									.maxTeamSize
							}
							required
						/>

					</div>


					<!-- APPLICATION OPEN -->

					<div class="field">

						<label
							for="applicationOpenAt"
						>
							Applications open
						</label>

						<input
							id="applicationOpenAt"
							name="applicationOpenAt"
							type="datetime-local"
							value={toDateTimeLocal(
								data.event
									.applicationOpenAt
							)}
						/>

					</div>


					<!-- APPLICATION CLOSE -->

					<div class="field">

						<label
							for="applicationCloseAt"
						>
							Applications close
						</label>

						<input
							id="applicationCloseAt"
							name="applicationCloseAt"
							type="datetime-local"
							value={toDateTimeLocal(
								data.event
									.applicationCloseAt
							)}
						/>

					</div>


					<!-- SUBMISSION CLOSE -->

					<div class="field">

						<label
							for="submissionsClose"
						>
							Submissions close
						</label>

						<input
							id="submissionsClose"
							name="submissionsClose"
							type="datetime-local"
							value={toDateTimeLocal(
								data.event
									.submissionsClose
							)}
						/>

					</div>


					<!-- JUDGING START -->

					<div class="field">

						<label
							for="judgingStartAt"
						>
							Judging starts
						</label>

						<input
							id="judgingStartAt"
							name="judgingStartAt"
							type="datetime-local"
							value={toDateTimeLocal(
								data.event
									.judgingStartAt
							)}
						/>

					</div>


					<!-- JUDGING DEADLINE -->

					<div class="field">

						<label
							for="judgingDeadline"
						>
							Judging deadline
						</label>

						<input
							id="judgingDeadline"
							name="judgingDeadline"
							type="datetime-local"
							value={toDateTimeLocal(
								data.event
									.judgingDeadline
							)}
						/>

					</div>


					<!-- RESULT ANNOUNCEMENT -->

					<div class="field">

						<label
							for="resultAnnouncement"
						>
							Result announcement
						</label>

						<input
							id="resultAnnouncement"
							name="resultAnnouncement"
							type="datetime-local"
							value={toDateTimeLocal(
								data.event
									.resultAnnouncement
							)}
						/>

					</div>


					<div class="timezone-note">
						<strong>
							Time zone
						</strong>

						<span>
							Times are entered in your local
							time zone and stored as exact
							timestamps. The same local clock
							time will be shown after saving.
						</span>
					</div>


					<div class="form-actions">

						<button
							type="submit"
							class="button primary"
						>
							Save Event Details
						</button>

						<button
							type="button"
							class="button"
							onclick={() =>
								(activeTab =
									'team-formation')}
						>
							Next →
						</button>

					</div>

				</form>

			</section>


		<!-- ================================================= -->
		<!-- TEAM FORMATION                                   -->
		<!-- ================================================= -->

		{:else if activeTab === 'team-formation'}

			<section class="section">

				<div class="section-heading">

					<div>

						<p class="section-number">
							02
						</p>

						<h2>
							Team formation.
						</h2>

						<p>
							Define how many participants can
							be part of a team.
						</p>

					</div>

				</div>


				<form
					method="POST"
					action="?/saveTeamFormation"
					class="form narrow"
				>

					<div class="field">

						<label for="teamMin">
							Minimum team size
						</label>

						<input
							id="teamMin"
							name="minTeamSize"
							type="number"
							min="1"
							value={
								data.event
									.minTeamSize
							}
							required
						/>

					</div>


					<div class="field">

						<label for="teamMax">
							Maximum team size
						</label>

						<input
							id="teamMax"
							name="maxTeamSize"
							type="number"
							min="1"
							value={
								data.event
									.maxTeamSize
							}
							required
						/>

					</div>


					<div class="info-box">

						<strong>
							How team formation works
						</strong>

						<p>
							Participants create their teams
							after applying to the event.
						</p>

					</div>


					<div class="form-actions">

						<button
							type="button"
							class="button"
							onclick={() =>
								(activeTab =
									'event-details')}
						>
							← Previous
						</button>

						<button
							type="submit"
							class="button primary"
						>
							Save Team Configuration
						</button>

						<button
							type="button"
							class="button"
							onclick={() =>
								(activeTab =
									'submission')}
						>
							Next →
						</button>

					</div>

				</form>

			</section>


		<!-- ================================================= -->
		<!-- SUBMISSION                                       -->
		<!-- ================================================= -->

		{:else}

			<section class="section">

				<div class="section-heading">

					<div>

						<p class="section-number">
							03
						</p>

						<h2>
							Submission.
						</h2>

						<p>
							Configure tracks, submission
							forms and custom questions.
						</p>

					</div>

				</div>


				<!-- TRACKS -->

				<div class="subsection">

					<div class="subsection-heading">

						<p class="mini-label">
							TRACKS
						</p>

						<h3>
							Tracks
						</h3>

					</div>


					<div class="items">

						{#if data.tracks.length === 0}

							<p class="muted">
								No tracks added yet.
							</p>

						{:else}

							{#each data.tracks as track}

								<div class="item">

									<div>

										<strong>
											{track.name}
										</strong>

										{#if track.description}

											<span>
												{track.description}
											</span>

										{/if}

									</div>


									<form
										method="POST"
										action="?/deleteTrack"
									>

										<input
											type="hidden"
											name="trackId"
											value={track.id}
										/>

										<button
											type="submit"
											class="delete-button"
										>
											Delete
										</button>

									</form>

								</div>

							{/each}

						{/if}

					</div>


					<form
						method="POST"
						action="?/addTrack"
						class="inline-form"
					>

						<input
							name="name"
							placeholder="Track name"
							required
						/>

						<input
							name="description"
							placeholder="Track description"
						/>

						<button
							type="submit"
							class="button"
						>
							+ Add track
						</button>

					</form>

				</div>


				<!-- FORMS -->

				<div class="subsection">

					<div class="subsection-heading">

						<p class="mini-label">
							SUBMISSION FORMS
						</p>

						<h3>
							Forms
						</h3>

					</div>


					<div class="items">

						{#if data.forms.length === 0}

							<p class="muted">
								No submission forms added yet.
							</p>

						{:else}

							{#each data.forms as form}

								<div class="item">

									<div>

										<strong>
											{form.name}
										</strong>

										<span>
											Custom submission
											questions can be added
											to this form.
										</span>

									</div>


									<form
										method="POST"
										action="?/deleteForm"
									>

										<input
											type="hidden"
											name="formId"
											value={form.id}
										/>

										<button
											type="submit"
											class="delete-button"
										>
											Delete
										</button>

									</form>

								</div>

							{/each}

						{/if}

					</div>


					<form
						method="POST"
						action="?/addForm"
						class="inline-form"
					>

						<input
							name="formName"
							placeholder="e.g. Project Submission"
							required
						/>

						<button
							type="submit"
							class="button"
						>
							+ Add form
						</button>

					</form>

				</div>


				<!-- CUSTOM QUESTIONS -->

				<div class="subsection">

					<div class="subsection-heading">

						<p class="mini-label">
							CUSTOM QUESTIONS
						</p>

						<h3>
							Submission questions
						</h3>

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

										<strong>
											{question.question}
										</strong>

										<span>
											{question.formName}
											·
											{question.questionType}
											{question.required
												? ' · Required'
												: ''}
										</span>

									</div>


									<form
										method="POST"
										action="?/deleteQuestion"
									>

										<input
											type="hidden"
											name="questionId"
											value={question.id}
										/>

										<button
											type="submit"
											class="delete-button"
										>
											Delete
										</button>

									</form>

								</div>

							{/each}

						{/if}

					</div>


					{#if data.forms.length > 0}

						<form
							method="POST"
							action="?/addQuestion"
							class="question-form"
						>

							<div class="field">

								<label
									for="questionForm"
								>
									Submission form
								</label>

								<select
									id="questionForm"
									name="formId"
									required
								>

									<option value="">
										Select form
									</option>

									{#each data.forms as form}

										<option
											value={form.id}
										>
											{form.name}
										</option>

									{/each}

								</select>

							</div>


							<div class="field">

								<label for="question">
									Question
								</label>

								<input
									id="question"
									name="question"
									placeholder="e.g. Describe your project"
									required
								/>

							</div>


							<div class="field">

								<label for="questionType">
									Question type
								</label>

								<select
									id="questionType"
									name="questionType"
									required
								>

									<option value="text">
										Text
									</option>

									<option value="textarea">
										Long text
									</option>

									<option value="number">
										Number
									</option>

									<option value="select">
										Select
									</option>

									<option value="radio">
										Radio
									</option>

									<option value="checkbox">
										Checkbox
									</option>

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

								<span>
									Required question
								</span>

							</label>


							<button
								type="submit"
								class="button"
							>
								+ Add question
							</button>

						</form>

					{:else}

						<div class="info-box">

							<strong>
								Create a submission form first.
							</strong>

							<p>
								Custom questions are attached to
								submission forms.
							</p>

						</div>

					{/if}

				</div>


				<!-- BOTTOM ACTIONS -->

				<div class="bottom-actions">

					<button
						type="button"
						class="button"
						onclick={() =>
							(activeTab =
								'team-formation')}
					>
						← Previous
					</button>


					<form
						method="POST"
						action="?/makeLive"
					>

						<button
							type="submit"
							class="button primary"
						>
							Make event live →
						</button>

					</form>

				</div>

			</section>

		{/if}

	</div>

{/if}


<style>
	/* ========================================================= */
	/* PARTICIPANT VIEW                                          */
	/* ========================================================= */

	.participant-page {
		min-height: 100vh;
		background: #f3f0e8;
		color: #111;
	}

	.participant-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 40px;
		padding: 56px 7vw;
		background: #fff;
		border-bottom: 2px solid #111;
	}

	.participant-back {
		display: block;
		margin-bottom: 35px;
		color: #111;
		font-size: 14px;
		font-weight: 700;
		text-decoration: none;
	}

	.participant-label,
	.section-label {
		margin: 0 0 12px;
		font-size: 11px;
		font-weight: 800;
		letter-spacing: 0.12em;
	}

	.participant-heading h1 {
		max-width: 900px;
		margin: 0;
		font-size: clamp(
			48px,
			8vw,
			96px
		);
		line-height: 0.9;
		letter-spacing: -0.06em;
	}

	.participant-tagline {
		max-width: 750px;
		margin: 24px 0 0;
		font-size: 21px;
		line-height: 1.4;
		color: #666;
	}

	.apply-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 15px 22px;
		background: #111;
		color: #fff;
		border: 2px solid #111;
		font-weight: 800;
		text-decoration: none;
		white-space: nowrap;
	}

	.apply-button:hover {
		background: #fff;
		color: #111;
	}

	.application-status {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 15px 22px;
		border: 2px solid #111;
		background: #f3f0e8;
		color: #111;
		font-size: 11px;
		font-weight: 800;
		letter-spacing: 0.08em;
		white-space: nowrap;
	}

	.participant-content {
		max-width: 1100px;
		margin: 0 auto;
		padding: 20px 7vw 80px;
	}

	.participant-section {
		padding: 48px 0;
		border-bottom: 2px solid #111;
	}

	.participant-section h2 {
		margin: 0 0 25px;
		font-size: clamp(
			36px,
			5vw,
			58px
		);
		line-height: 1;
		letter-spacing: -0.05em;
	}

	.event-description {
		max-width: 850px;
		font-size: 17px;
		line-height: 1.8;
		white-space: pre-wrap;
	}

	.muted {
		opacity: 0.55;
	}

	.team-size-grid {
		display: grid;
		grid-template-columns:
			repeat(2, minmax(180px, 280px));
		gap: 20px;
	}

	.team-size-card {
		padding: 25px;
		background: #fff;
		border: 2px solid #111;
	}

	.team-size-card span {
		display: block;
		margin-bottom: 12px;
		font-size: 11px;
		font-weight: 800;
		letter-spacing: 0.1em;
	}

	.team-size-card strong {
		display: block;
		font-size: 52px;
		line-height: 1;
	}

	.team-size-card p {
		margin: 8px 0 0;
		color: #666;
	}

	.application-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 25px;
		margin-top: 28px;
		padding: 22px;
		border: 2px solid #111;
		background: #fff;
	}

	.application-card > div:first-child {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.application-card span {
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 0.1em;
	}

	.application-card strong {
		font-size: 24px;
	}

	.application-card p {
		margin: 0;
		color: #666;
		font-size: 13px;
	}

	.application-complete {
		padding: 9px 12px;
		border: 1px solid #111;
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 0.08em;
		white-space: nowrap;
	}

	.tracks-grid {
		display: grid;
		grid-template-columns:
			repeat(
				auto-fit,
				minmax(250px, 1fr)
			);
		gap: 18px;
	}

	.track-card {
		padding: 24px;
		background: #fff;
		border: 2px solid #111;
	}

	.track-card h3 {
		margin: 0 0 12px;
		font-size: 24px;
	}

	.track-card p {
		margin: 0;
		line-height: 1.6;
	}

	.dates-grid {
		display: grid;
		grid-template-columns:
			repeat(
				auto-fit,
				minmax(230px, 1fr)
			);
		gap: 24px;
	}

	.date-item {
		display: flex;
		flex-direction: column;
		gap: 7px;
	}

	.date-item span {
		font-size: 11px;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.date-item strong {
		line-height: 1.4;
	}

	.participant-apply {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 30px;
		margin-top: 48px;
		padding: 35px;
		background: #111;
		color: #fff;
	}

	.participant-apply h2 {
		margin: 0 0 8px;
		font-size: 42px;
	}

	.participant-apply p:last-child {
		margin: 0;
		color: #bbb;
	}

	.apply-button-light {
		background: #fff;
		color: #111;
		border-color: #fff;
	}

	.apply-button-light:hover {
		background: transparent;
		color: #fff;
	}


	/* ========================================================= */
	/* ORGANIZER EDITOR                                          */
	/* ========================================================= */

	:global(body) {
		margin: 0;
		background: #f3f0e8;
		color: #111;
		font-family:
			Inter,
			ui-sans-serif,
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			"Segoe UI",
			sans-serif;
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

	.page h1 {
		margin: 0 0 20px;
		font-size: clamp(
			48px,
			8vw,
			96px
		);
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
		grid-template-columns:
			repeat(3, 1fr);
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

	.page h2 {
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
		grid-template-columns:
			repeat(2, 1fr);
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

	.field input,
	.field textarea,
	.field select,
	.inline-form input,
	.question-form input,
	.question-form select {
		box-sizing: border-box;
		width: 100%;
		border: 2px solid #111;
		border-radius: 0;
		background: transparent;
		color: #111;
		padding: 13px 14px;
		font: inherit;
	}

	.field input[type='datetime-local'] {
		min-height: 48px;
	}

	textarea {
		resize: vertical;
	}

	.timezone-note {
		grid-column: 1 / -1;
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 16px;
		border: 1px solid #999;
		background: rgba(255, 255, 255, 0.35);
	}

	.timezone-note strong {
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.timezone-note span {
		font-size: 13px;
		line-height: 1.5;
		color: #666;
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

	.page h3 {
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
	.question-form {
		display: grid;
		gap: 16px;
	}

	.inline-form {
		grid-template-columns:
			1fr 1fr auto;
	}

	.question-form {
		grid-template-columns:
			repeat(2, 1fr);
	}

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

	@media (max-width: 800px) {

		.participant-header {
			flex-direction: column;
		}

		.participant-header
			.apply-button,
		.participant-header
			.application-status {
			width: 100%;
		}

		.team-size-grid {
			grid-template-columns: 1fr;
		}

		.application-card {
			flex-direction: column;
			align-items: stretch;
		}

		.application-complete {
			text-align: center;
		}

		.participant-apply {
			flex-direction: column;
			align-items: stretch;
		}

		.participant-apply
			.apply-button {
			width: 100%;
		}

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
		.question-form {
			grid-template-columns: 1fr;
		}

		.field.full {
			grid-column: auto;
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
		.bottom-actions .button {
			width: 100%;
		}

		.timezone-note {
			grid-column: auto;
		}
	}
</style>