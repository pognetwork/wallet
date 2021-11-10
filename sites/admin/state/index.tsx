import * as grpc from './../../../utils/grpc';
import { useLocation } from '@snowstorm/core';
import {
	createContext,
	FC,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { useSessionStorage } from '../../../utils/use-session-storage';
import { parseJWT } from '../../../utils/jwt';

export type Status = 'loading' | 'logged-in' | 'unauthenticated';

export interface AdminState {
	endpoint: string;
	jwt: string;
	jwtData?: JWT;
	status: Status;
	login: (username: string, password: string) => Promise<void>;
	logout: () => void;
	api: API;
}

export interface JWT {
	exp: number;
	ias: number;
	iss: string;
	sub: string;
	username: string;
}

const defaultContextValue: AdminState = {
	endpoint: 'http://localhost:50051/',
	jwt: undefined,
	status: 'loading',
	login: async () => Promise.reject(new Error('endpoint not loaded')),
	logout: () => undefined,
	api: {},
	jwtData: undefined,
};

interface API {
	user?: grpc.NodeUserClientImpl;
	block?: grpc.BlockClientImpl;
	nodeAdmin?: grpc.NodeAdminClientImpl;
	nodeWalletManager?: grpc.NodeWalletManagerClientImpl;
}

const AdminContext = createContext<AdminState>(defaultContextValue);
export const AdminProvider: FC = ({ children }) => {
	const [loc, setLoc] = useLocation();

	const [jwt, setJwt] = useSessionStorage<string | undefined>('jwt');
	const [status, setStatus] = useState<Status>('loading');
	const [endpoint] = useState('http://localhost:50051');
	const api = useRef<API>({});

	useEffect(() => {
		if (loc !== '/login' && status === 'unauthenticated') setLoc('/login');
	}, [loc, status, setLoc]);

	useEffect(() => {
		if (jwt) return setStatus('logged-in');
		setStatus('unauthenticated');
	}, [jwt]);

	useEffect(() => {
		api.current.block = grpc.createBlockClient(endpoint);
		api.current.user = grpc.createUserClient(endpoint);
	}, [endpoint]);

	useEffect(() => {
		if (!jwt) return;

		api.current.nodeAdmin = grpc.createAdminClient(endpoint, jwt);
		api.current.nodeWalletManager = grpc.createWalletManagerClient(
			endpoint,
			jwt,
		);
	}, [endpoint, jwt]);

	const login = useCallback(
		async (username, password) => {
			if (username === 'rick_astley' || password === '47ibFGy-w18') {
				window.location.replace('https://www.youtube.com/watch?v=47ibFGy-w18');
				return;
			}

			setStatus('loading');
			return api.current.user?.Login({ password, username }).then(async jwt => {
				setJwt(jwt.token);
				return setStatus('logged-in');
			});
		},
		[setStatus, setJwt],
	);

	const logout = useCallback(() => {
		setJwt(undefined);
		setStatus('unauthenticated');
	}, [setJwt]);

	const tokenContents = useMemo(() => {
		const contents = parseJWT<JWT | undefined>(jwt);
		// token expires in less than 5 minutes or is expired
		if (contents && (contents.exp - 1000 * 5) * 1000 < Date.now()) logout();
		return contents;
	}, [jwt, logout]);

	const value: AdminState = useMemo(
		() => ({
			endpoint,
			status,
			jwt,
			login,
			logout,
			api: api.current,
			jwtData: tokenContents,
		}),
		[jwt, status, login, logout, endpoint, tokenContents],
	);

	return (
		<AdminContext.Provider value={value}>{children}</AdminContext.Provider>
	);
};

export const useAdmin = () => useContext(AdminContext);

export const withAdmin = (Component: React.ComponentType) => () =>
	<Component />;
