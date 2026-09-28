export type JudgeCriterion = {
	id: string;
	name: string;
	weight: number;
	maxScore: number | null;
};

export type JudgeCustomAnswer = {
	question: string;
	answer: string | null;
};

export type JudgeProject = {
	assignmentId: string;
	projectId: string;

	title: string;
	tagline: string | null;
	summary: string | null;

	teamName: string;
	trackName: string | null;

	thumbnail: string | null;
	imageGallery: string[];

	demoVideoUrl: string | null;
	repoUrl: string | null;
	deployedLiveLink: string | null;

	techTags: string[];

	customAnswers: JudgeCustomAnswer[];

	criteria: JudgeCriterion[];

	scores: Record<string, number | null>;

	comment: string | null;

	/**
	 * True when every configured rubric criterion
	 * has been scored.
	 */
	scored: boolean;
};

export type JudgeAssignment = {
	id: string;
	judgeId: string;
	projectId: string;
	assignedAt: Date;
	comment: string | null;
};

export type JudgeInvitePayload = {
	judgeId: string;
	name: string;
	email: string | null;
	expiresAt: Date | null;
};

export type AssignmentResult = {
	projectId: string;
	judgeIds: string[];
};

export type AssignmentWarning = {
	projectId: string;
	reason: string;
};

export type AssignmentRunResult = {
	assignments: AssignmentResult[];
	warnings: AssignmentWarning[];
};

export type ScoreInput = {
	criterionId: string;
	score: number;
};

export type JudgeScore = {
	id: string;
	judgeAssignmentId: string;
	criterionId: string;
	score: number;
};