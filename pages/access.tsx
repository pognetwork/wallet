import { useState } from 'react';
import { WALLET_TYPES } from '../utils/types';

import styles from '../components/create-access/styles.module.scss';
import { Layout } from '../components/layout';
import { SelectType } from '../components/create-access/select';

const AccessLulw = () => <div />;

export const Access = () => {
	const [type, setType] = useState<WALLET_TYPES | undefined>();
	const select = (type: WALLET_TYPES) => () => {
		setType(type);
	};

	let component = <SelectType type="access" select={select} />;
	if (type === WALLET_TYPES.LULW_FILE) {
		component = <AccessLulw />;
	}

	return (
		<Layout className={styles.layout}>
			<div className={styles.content}>{component}</div>
		</Layout>
	);
};
