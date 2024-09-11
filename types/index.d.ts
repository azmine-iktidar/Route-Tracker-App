// types.d.ts

// Type for a user in the app
export interface User {
  id: string; // Unique ID for the user using randomUUID function from expo crypto
  username: string;
  email: string;
  avatarUrl?: string; // Optional
  isAuthenticated: boolean;
  groupId?: string; // Optional: if the user is part of a group
  token?: string;
}

// Type for Authentication response
export interface AuthResponse {
  user: User;
  token: string;
}

// Type for a group
export interface Group {
  id: string;
  name: string;
  members: User[];
  createdAt: string;
  updatedAt: string;
}

// Type for location coordinates
export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number; // Optional: GPS accuracy in meters
  altitude?: number; // Optional: Altitude in meters
  speed?: number; // Optional: Speed in meters/second
  timestamp: number;
}

// Type for a route point (waypoints that form a route)
export interface RoutePoint {
  id: string;
  location: Location;
  timestamp: number;
}

// types.d.ts

export type LocationType = {
  latitude: number; // Latitude of the location (required)
  longitude: number; // Longitude of the location (required)
  accuracy?: number; // Accuracy of the location in meters (optional)
  altitude?: number; // Altitude in meters (optional)
  speed?: number; // Speed in meters per second (optional)
  timestamp?: number; // Timestamp of the location reading (optional)
};

// Type for a route marked by a user
export interface RouteType {
  user_id: string;
  id: string;
  name: string;
  createdBy: string;
  points: RoutePoint[]; // Array of waypoints making up the route
  createdAt: string;
  updatedAt: string;
  isShared?: boolean; // Optional: Whether the route is shared with others
  distance?: number; // Optional: The total distance of the route in meters
}

// Type for a request to save a route
export interface SaveRouteRequest {
  routeName: string;
  points: Location[];
  isShared?: boolean; // Optional: Whether the route is public or private
}

// Type for a response after saving a route
export interface SaveRouteResponse {
  success: boolean;
  route: RouteType;
}

// Type for a group location update (when group members share locations)
export interface GroupLocationUpdate {
  userId: string;
  location: Location;
  timestamp: number;
}

// Type for sharing live location
export interface ShareLocationRequest {
  userId: string;
  groupId: string;
  location: Location;
}

// Type for stopping live location sharing
export interface StopSharingLocationRequest {
  userId: string;
  groupId: string;
}

// Type for directions (if navigation is included)
export interface DirectionStep {
  instruction: string;
  distance: number; // Distance in meters for the step
  duration: number; // Duration in seconds for the step
  polyline: string; // Encoded polyline for the step
}

// Type for the directions request
export interface DirectionsRequest {
  startLocation: Location;
  endLocation: Location;
}

// Type for the directions response
export interface DirectionsResponse {
  steps: DirectionStep[];
  totalDistance: number; // Total distance in meters
  totalDuration: number; // Total duration in seconds
}

// Type for map settings
export interface MapSettings {
  zoomLevel?: number; // Optional: Default zoom level
  offlineEnabled?: boolean; // Optional: Whether offline maps are enabled
  showTraffic?: boolean; // Optional: Whether to show traffic on the map
}

// Type for app configuration options
export interface AppConfig {
  apiUrl: string; // Base URL for backend API
  enableOfflineMaps: boolean;
  maxRoutePoints?: number; // Optional: Maximum number of waypoints per route
  allowGroupSharing: boolean;
  mapSettings: MapSettings;
}

// Type for error responses from the server
export interface ErrorResponse {
  errorCode: string;
  message: string;
}

// Optional parameters for tracking options
export interface TrackingOptions {
  interval?: number; // Optional: How often to update location in milliseconds
  distanceFilter?: number; // Optional: Minimum distance between updates in meters
  accuracy?: "high" | "medium" | "low"; // Optional: Accuracy level for location tracking
}

// Type for the current user's live tracking data
export interface LiveTracking {
  isTracking: boolean;
  currentLocation?: Location; // Optional: User's current location
  previousLocations?: Location[]; // Optional: Previous locations tracked
  group?: Group; // Optional: Current group if in one
}

// Type for route data passed to a component
export interface RouteProps {
  routeId: string;
  name: string;
  points: RoutePoint[];
}

// Authentication related requests
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LogoutRequest {
  token: string;
}

// API types for fetching data
export interface FetchGroupRequest {
  groupId: string;
}

export interface FetchRouteRequest {
  routeId: string;
}

export interface FetchRoutesForUserRequest {
  userId: string;
}

// Location sharing response (after sharing location with a group)
export interface ShareLocationResponse {
  success: boolean;
  message: string;
  sharedLocation?: Location;
}
export interface LocationType {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  timestamp: number;
}

export interface RoutePoint {
  id: string;
  location: LocationType;
  timestamp: number;
}

export interface Checkpoint {
  id: string;
  location: LocationType;
}

export interface RouteType {
  id: string;
  name: string;
  createdBy: string;
  points: RoutePoint[];
  checkpoints: Checkpoint[];
  createdAt: string;
  updatedAt: string;
}

export interface dbErrorType {
  code: string;
  details: string;
  hint: any;
  message: string;
}

export interface Session {
  userId: string;
  token: string;
  expirationDate: string;
}

export interface RootStackParamList extends ParamListBase {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  Map: undefined;
  Profile: undefined;
  Group: undefined;
  Route: { routeId: string };
  CreateRoute: undefined;
  CreateGroup: undefined;
  GroupDetails: { groupId: string };
  GroupMap: { groupId: string };
  Settings: undefined;
  About: undefined;
  Help: undefined;
  NotFound: undefined;
}
export interface RouteWithUser extends RouteType {
  user: User;
  created_at: string; // This should match the format returned by your database
}
// Group Type

// GroupMember Type

// Invite Type
export interface GroupInvite {
  id: string;
  groupId: string;
  email: string;
  invitedBy: string; // ID of the user who sent the invite
  inviteStatus: "pending" | "accepted" | "rejected";
  createdAt: string;
}

// Route Type
export interface Route {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isShared: boolean; // Whether the route is shared with a group
}

// RouteSharing Type
export interface RouteSharing {
  routeId: string;
  userId: string;
}
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Map: undefined;
  RouteList: undefined;
  Group: undefined;
  AboutApp: undefined;
};

export type GroupStackParamList = {
  GroupMain: undefined;
  GroupDetail: { group: Group };
  Invites: { invites: GroupInvite[] };
};

export interface Group {
  id: string;
  name: string;
  handle: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  group_id: string;
  user_id: string;
  role: "admin" | "member";
  joined_at: string;
}
