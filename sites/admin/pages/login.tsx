import { Input } from '../../../components/input';
import { Layout } from '../components/layout';
import styles from './login.module.scss';
import { ChangeEvent, useState } from 'react';
import { useAdmin, withAdmin } from '../hooks/admin';

export const Login = withAdmin(() => {
	const admin = useAdmin();
	const [password, setPassword] = useState('');
	const [username, setUsername] = useState('');

	const onChange =
		(func: (str: string) => void) => (e: ChangeEvent<HTMLInputElement>) =>
			func(e.target.value);

	const onLogin = () => {
		admin.login(username, password);
	};

	return (
		<Layout className={styles.layout}>
			<div>
				<h1>Login</h1>
				<div className={styles.inputs}>
					<Input
						onChange={onChange(setUsername)}
						value={username}
						placeholder="Username"
					/>
					<Input
						onChange={onChange(setPassword)}
						value={password}
						password
						placeholder="Password"
					/>
				</div>
				<button onClick={onLogin} type="button">
					Login
				</button>
			</div>
		</Layout>
	);
});
