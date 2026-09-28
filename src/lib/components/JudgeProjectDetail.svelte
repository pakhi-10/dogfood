<script lang="ts">
	import JudgeRubric from './JudgeRubric.svelte';
	import type { JudgeProject } from '$lib/server/judge/types';

	let {
		project,
		onBack
	}: {
		project: JudgeProject;
		onBack: () => void;
	} = $props();

	let scores = $state<Record<string, number | null>>({});
	let comment = $state(project.comment ?? '');

	$effect(() => {
		const initialScores: Record<string, number | null> = {};

		for (const criterion of project.criteria) {
			initialScores[criterion.id] =
				project.scores[criterion.id] ?? null;
		}

		scores = initialScores;
		comment = project.comment ?? '';
	});

	function setScore(criterionId: string, value: number | null) {
		scores[criterionId] = value;
	}
</script>

<div class="page">
	<div class="topbar">
		<button class="back" onclick={onBack}>
			← Back
		</button>
	</div>

	<div class="content">
		<header>
			{#if project.thumbnail}
				<img
					src={project.thumbnail}
					alt={project.title}
					class="thumbnail"
				/>
			{/if}

			<div>
				<h1>{project.title}</h1>

				{#if project.tagline}
					<p class="tagline">
						{project.tagline}
					</p>
				{/if}

				<p class="byline">
					by <strong>{project.teamName}</strong>
				</p>
			</div>
		</header>

		<div class="meta">
			{#if project.trackName}
				<div>
					<strong>Track</strong>
					<span>{project.trackName}</span>
				</div>
			{/if}
		</div>

		<section>
			<h2>Project summary</h2>

			<p class="summary">
				{project.summary || 'No summary provided.'}
			</p>
		</section>

		{#if project.techTags.length > 0}
			<section>
				<h2>Tech stack</h2>

				<div class="tags">
					{#each project.techTags as tag}
						<span>{tag}</span>
					{/each}
				</div>
			</section>
		{/if}

		<section>
			<h2>Submission answers</h2>

			{#if project.customAnswers.length === 0}
				<p class="muted">
					No custom submission questions were answered.
				</p>
			{:else}
				<div class="answers">
					{#each project.customAnswers as item}
						<div class="answer">
							<div class="question">
								{item.question}
							</div>

							<div class="answer-value">
								{item.answer || 'No answer provided.'}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</section>

		<section>
			<h2>Project links</h2>

			<div class="links">
				{#if project.demoVideoUrl}
					<a
						href={project.demoVideoUrl}
						target="_blank"
						rel="noreferrer"
					>
						Demo video →
					</a>
				{/if}

				{#if project.repoUrl}
					<a
						href={project.repoUrl}
						target="_blank"
						rel="noreferrer"
					>
						GitHub repository →
					</a>
				{/if}

				{#if project.deployedLiveLink}
					<a
						href={project.deployedLiveLink}
						target="_blank"
						rel="noreferrer"
					>
						Live deployment →
					</a>
				{/if}
			</div>
		</section>

		{#if project.imageGallery.length > 0}
			<section>
				<h2>Image gallery</h2>

				<div class="gallery">
					{#each project.imageGallery as image}
						<a
							href={image}
							target="_blank"
							rel="noreferrer"
						>
							View image →
						</a>
					{/each}
				</div>
			</section>
		{/if}

		<JudgeRubric
			criteria={project.criteria}
			scores={scores}
			onScore={setScore}
		/>

		<section class="comment-section">
			<h2>Judge's comment</h2>

			<textarea
				bind:value={comment}
				placeholder="Enter your overall comments for this project..."
				rows="6"
			></textarea>
		</section>

		<div class="save-area">
			<p>
				Score persistence will be connected to the judge API after
				the organizer rubric schema is finalized.
			</p>
		</div>
	</div>
</div>

<style>
	.page {
		min-height: 100vh;
		background: #f3f0e8;
		color: #111;
	}

	.topbar {
		position: sticky;
		top: 0;
		z-index: 10;
		padding: 16px 24px;
		background: #f3f0e8;
		border-bottom: 2px solid #111;
	}

	.back {
		border: 2px solid #111;
		background: #fff;
		padding: 9px 14px;
		border-radius: 6px;
		font-weight: 900;
		cursor: pointer;
	}

	.content {
		max-width: 950px;
		margin: 0 auto;
		padding: 40px 24px 80px;
	}

	header {
		display: flex;
		gap: 24px;
		align-items: flex-start;
	}

	h1 {
		margin: 0;
		font-size: 40px;
		line-height: 1;
		font-weight: 900;
	}

	.thumbnail {
		width: 180px;
		height: 120px;
		object-fit: cover;
		border: 2px solid #111;
		border-radius: 8px;
	}

	.tagline {
		margin: 12px 0 0;
		font-size: 18px;
	}

	.byline {
		margin-top: 10px;
	}

	.meta {
		margin: 28px 0;
	}

	.meta div {
		display: flex;
		gap: 10px;
	}

	section {
		margin-top: 32px;
	}

	h2 {
		font-size: 21px;
		font-weight: 900;
		margin-bottom: 12px;
	}

	.summary {
		line-height: 1.7;
		white-space: pre-wrap;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.tags span {
		padding: 6px 10px;
		border: 2px solid #111;
		border-radius: 5px;
		background: #fff;
		font-weight: 800;
	}

	.answers {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.answer {
		padding: 16px;
		border: 2px solid #111;
		background: #fff;
	}

	.question {
		font-weight: 900;
		margin-bottom: 8px;
	}

	.answer-value {
		white-space: pre-wrap;
		line-height: 1.5;
	}

	.links,
	.gallery {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}

	.links a,
	.gallery a {
		display: inline-block;
		padding: 10px 14px;
		border: 2px solid #111;
		border-radius: 6px;
		background: #fff;
		color: #111;
		font-weight: 900;
		text-decoration: none;
	}

	.muted {
		color: #555;
	}

	.comment-section textarea {
		width: 100%;
		box-sizing: border-box;
		padding: 14px;
		border: 2px solid #111;
		border-radius: 7px;
		resize: vertical;
		font: inherit;
		background: #fff;
		color: #111;
	}

	.save-area {
		margin-top: 32px;
		padding: 16px;
		border: 2px dashed #111;
		font-size: 13px;
		font-weight: 700;
	}
</style>