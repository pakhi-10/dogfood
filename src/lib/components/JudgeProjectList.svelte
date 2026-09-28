<script lang="ts">
	import type { JudgeProject } from '$lib/server/judge/types';

	let {
		projects,
		onSelect
	}: {
		projects: JudgeProject[];
		onSelect: (project: JudgeProject) => void;
	} = $props();
</script>

<div class="project-list">
	{#if projects.length === 0}
		<div class="empty">
			<h2>No projects assigned</h2>
			<p>
				You currently have no projects assigned to you for this event.
			</p>
		</div>
	{:else}
		{#each projects as project}
			<button
				class:scored={project.scored}
				class:pending={!project.scored}
				class="project-card"
				onclick={() => onSelect(project)}
			>
				<div class="status"></div>

				<div class="project-content">
					<div class="project-title">
						{project.title}
					</div>

					<div class="team">
						by {project.teamName}
					</div>

					{#if project.tagline}
						<div class="tagline">
							{project.tagline}
						</div>
					{/if}

					{#if project.trackName}
						<div class="track">
							{project.trackName}
						</div>
					{/if}
				</div>

				<div class="arrow">
					→
				</div>
			</button>
		{/each}
	{/if}
</div>

<style>
	.project-list {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.project-card {
		width: 100%;
		display: flex;
		align-items: stretch;
		text-align: left;
		padding: 0;
		border: 2px solid #111;
		border-radius: 10px;
		background: #fff;
		color: #111;
		cursor: pointer;
		overflow: hidden;
		box-shadow: 4px 4px 0 #111;
		transition:
			transform 0.1s ease,
			box-shadow 0.1s ease;
	}

	.project-card:hover {
		transform: translate(-2px, -2px);
		box-shadow: 6px 6px 0 #111;
	}

	.project-card:active {
		transform: translate(0, 0);
		box-shadow: 2px 2px 0 #111;
	}

	.status {
		width: 10px;
		flex-shrink: 0;
	}

	.scored .status {
		background: #59d56b;
	}

	.pending .status {
		background: #f3c94b;
	}

	.project-content {
		padding: 18px 20px;
		flex: 1;
	}

	.project-title {
		font-size: 20px;
		font-weight: 900;
	}

	.team {
		margin-top: 4px;
		font-size: 14px;
		font-weight: 700;
	}

	.tagline {
		margin-top: 10px;
		font-size: 14px;
	}

	.track {
		display: inline-block;
		margin-top: 10px;
		padding: 4px 8px;
		border: 1px solid #111;
		border-radius: 5px;
		font-size: 11px;
		font-weight: 900;
		text-transform: uppercase;
	}

	.arrow {
		display: grid;
		place-items: center;
		padding: 0 20px;
		font-size: 25px;
		font-weight: 900;
	}

	.empty {
		padding: 50px;
		border: 2px dashed #111;
		text-align: center;
	}

	.empty h2 {
		margin: 0;
		font-size: 22px;
	}

	.empty p {
		margin-top: 8px;
	}
</style>