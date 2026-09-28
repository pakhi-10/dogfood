<script lang="ts">
	import { onMount } from 'svelte';

	import JudgeTimer from '$lib/components/JudgeTimer.svelte';
	import JudgeProgress from '$lib/components/JudgeProgress.svelte';
	import JudgeProjectList from '$lib/components/JudgeProjectList.svelte';
	import JudgeProjectDetail from '$lib/components/JudgeProjectDetail.svelte';

	let { data } = $props();

	let now = $state(Date.now());
	let selectedProjectId = $state<string | null>(null);

	onMount(() => {
		const interval = window.setInterval(() => {
			now = Date.now();
		}, 1000);

		return () => {
			window.clearInterval(interval);
		};
	});

	let startTime = $derived(
		data.event.judgingStartAt
			? new Date(data.event.judgingStartAt).getTime()
			: null
	);

	let deadline = $derived(
		data.event.judgingDeadline
			? new Date(data.event.judgingDeadline).getTime()
			: null
	);

	let scheduleConfigured = $derived(
		startTime !== null && deadline !== null
	);

	let judgingOpen = $derived(
		scheduleConfigured &&
			now >= startTime! &&
			now <= deadline!
	);

	let judgingFinished = $derived(
		scheduleConfigured &&
			now > deadline!
	);

	let selectedProject = $derived(
		data.projects.find(
			(project) => project.projectId === selectedProjectId
		) ?? null
	);

	let scoredCount = $derived(
		data.projects.filter(
			(project) => project.scored
		).length
	);

	function openProject(projectId: string) {
		selectedProjectId = projectId;
	}

	function closeProject() {
		selectedProjectId = null;
	}
</script>

<svelte:head>
	<title>
		Judge Console — {data.event.name} — DOGFOOD
	</title>
</svelte:head>

{#if selectedProject}
	<JudgeProjectDetail
		project={selectedProject}
		onBack={closeProject}
	/>
{:else}
	<div class="page">
		<header class="header">
			<div>
				<div class="eyebrow">
					Judge Console
				</div>

				<h1>{data.event.name}</h1>

				<p>
					Review and score your assigned projects.
				</p>
			</div>

			{#if scheduleConfigured && !judgingFinished}
				<JudgeTimer
					startAt={data.event.judgingStartAt}
					endAt={data.event.judgingDeadline}
				/>
			{/if}
		</header>

		<main class="content">
			{#if !scheduleConfigured}
				<div class="state-box">
					<h2>Judging window not configured</h2>

					<p>
						The organizer has not configured the judging
						start and deadline yet.
					</p>
				</div>

			{:else if !judgingOpen && !judgingFinished}
				<div class="state-box waiting">
					<div class="state-icon">
						⏳
					</div>

					<h2>
						Judging has not opened yet
					</h2>

					<p>
						You will be able to access your assigned projects
						when the judging window opens.
					</p>

					<JudgeTimer
						startAt={data.event.judgingStartAt}
						endAt={data.event.judgingDeadline}
					/>
				</div>

			{:else if judgingFinished}
				<div class="state-box closed">
					<h2>
						Judging window closed
					</h2>

					<p>
						The judging deadline for this event has passed.
					</p>
				</div>

			{:else}
				<JudgeProgress
					scored={scoredCount}
					total={data.projects.length}
				/>

				<div class="section-heading">
					<h2>Assigned projects</h2>

					<p>
						Only projects assigned to you are shown here.
					</p>
				</div>

				<JudgeProjectList
					projects={data.projects}
					onSelect={(project) =>
						openProject(project.projectId)}
				/>
			{/if}
		</main>
	</div>
{/if}

<style>
	.page {
		min-height: 100vh;
		background: #f3f0e8;
		color: #111;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 30px;
		padding: 30px 40px;
		border-bottom: 2px solid #111;
	}

	.eyebrow {
		font-size: 11px;
		font-weight: 900;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		margin-bottom: 8px;
	}

	h1 {
		margin: 0;
		font-size: 38px;
		font-weight: 900;
	}

	.header p {
		margin: 8px 0 0;
		font-size: 15px;
	}

	.content {
		max-width: 1000px;
		margin: 0 auto;
		padding: 30px 24px 80px;
	}

	.section-heading {
		margin: 30px 0 15px;
	}

	.section-heading h2 {
		margin: 0;
		font-size: 24px;
		font-weight: 900;
	}

	.section-heading p {
		margin-top: 5px;
		font-size: 14px;
	}

	.state-box {
		margin-top: 50px;
		padding: 40px;
		border: 2px solid #111;
		background: #fff;
		text-align: center;
		box-shadow: 5px 5px 0 #111;
	}

	.state-box h2 {
		margin: 0;
		font-size: 27px;
		font-weight: 900;
	}

	.state-box p {
		max-width: 550px;
		margin: 12px auto 25px;
		line-height: 1.5;
	}

	.state-icon {
		font-size: 35px;
		margin-bottom: 10px;
	}

	.waiting :global(.timer) {
		display: inline-block;
		text-align: left;
	}

	.closed {
		background: #e8e5dc;
	}

	@media (max-width: 700px) {
		.header {
			flex-direction: column;
			padding: 24px;
		}

		h1 {
			font-size: 30px;
		}

		.content {
			padding: 20px 16px 60px;
		}
	}
</style>