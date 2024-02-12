export type RobotColor = 'r' | 'y' | 'g' | 'u' | 'b';
export type GoalColor = 'r' | 'y' | 'g' | 'u' | 'm';
export type GoalShape = 'vortex' | 'crescent' | 'star' | 'gear' | 'planet';
export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Coordinate {
    x: number;
    y: number;
}
export interface Goal {
    color: GoalColor;
    shape: GoalShape;
    coord: Coordinate;
}
export interface Bid {
    player: string;
    moves: number;
}
export interface Tile {
    goal: Goal | null;
    robot: RobotColor | null;
    right_wall: boolean;
    left_wall: boolean;
    top_wall: boolean;
    bottom_wall: boolean;
    coord: Coordinate;
}
export interface GameConfig {
    num_rounds: number;
    pre_bid_timeout: number;
    post_bid_timeout: number;
    demo_timeout: number;
}
export const DEFAULT_CONFIG = {
    num_rounds: 8,
    pre_bid_timeout: 300000,
    post_bid_timeout: 60000,
    demo_timeout: 30000
} as GameConfig;

interface BaseMessageToPlayer {
    category: string;
    log?: string;
}
export interface Log extends BaseMessageToPlayer {
    category: 'log';
    log: string;
}
export interface Chat extends BaseMessageToPlayer {
    category: 'chat';
    name: string;
    msg: string;
}
export interface CheckIn extends BaseMessageToPlayer {
    category: 'check_in';
    name: string;
    game_code: string;
    round: number;
    is_host: boolean;
    game_config: GameConfig;
    players: [string, number][];
    right_walls: Coordinate[];
    bottom_walls: Coordinate[];
    goals: Goal[];
}
export interface PlayerUpdate extends BaseMessageToPlayer {
    category: 'player_update';
    name: string;
    add: boolean;
}
export interface ConfigUpdate extends BaseMessageToPlayer {
    category: 'config_update',
    game_config: GameConfig;
}
export interface RobotUpdate extends BaseMessageToPlayer {
    category: 'robot_update';
    robots: [RobotColor, Coordinate][];
}
export interface Timer extends BaseMessageToPlayer {
    category: 'timer';
    seconds: number;
}
export interface Start extends BaseMessageToPlayer {
    category: 'start';
}
export interface NewRound extends BaseMessageToPlayer {
    category: 'new_round';
    goal: Goal;
    log: string;
}
export interface BidNotif extends BaseMessageToPlayer {
    category: 'bid';
    name: string;
    moves: number;
    log: string;
}
export interface Demonstrator extends BaseMessageToPlayer {
    category: 'demonstrator';
    name: string;
    moves: number;
    log: string;
}
export interface Score extends BaseMessageToPlayer {
    category: 'score';
    name: string;
    points: number;
    log: string;
}
export type GenericMessageToPlayer =
    | Log
    | Chat
    | CheckIn
    | PlayerUpdate
    | RobotUpdate
    | ConfigUpdate
    | Timer
    | Start
    | NewRound
    | BidNotif
    | Demonstrator
    | Score;

export interface StartRequest {
    category: 'start';
}
export interface BidRequest {
    category: 'bid';
    moves: number;
}
export interface MoveRequest {
    category: 'move';
    robot: RobotColor;
    direction: Direction;
}
export interface ConfigChangeRequest {
    category: 'config'
    config: GameConfig
}
export interface ChatRequest {
    category: 'chat';
    msg: string;
}
export type GenericMessageToAPI = StartRequest | BidRequest | MoveRequest | ConfigChangeRequest | ChatRequest;
