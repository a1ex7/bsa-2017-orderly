import React from 'react';
import { List } from 'semantic-ui-react';
import R from 'ramda';

import TeamModal from './teamModal';
import './namePopup.scss';

const hidingStyle = (isOpen) => ({
	display: isOpen ? 'block' : 'none'
})

const NamePopup = ({ toggleTeamPopup, teamPopupIsShow, setTeamModal,
	                   activeModal, team, updateTeam, deleteTeam }) => (
	<div>
		<List className='team_popup'
		      style={hidingStyle(teamPopupIsShow)}>
			<List.Item className='list_menu'
			           onClick={() => {
			           	setTeamModal('settings')
			}}>
				<List.Icon name='cogs'/>
				<List.Content>Team settings</List.Content>
			</List.Item>
			<List.Item className='list_menu'
			           onClick={() => {
			           	setTeamModal('rename')
			}}>
				<List.Icon name='pencil'/>
				<List.Content>Rename team</List.Content>
			</List.Item>
			<List.Item className='list_menu'
			           onClick={() => {
			           	setTeamModal('delete')
			}}>
				<List.Icon name='trash outline'/>
				<List.Content>Delete team</List.Content>
			</List.Item>
		</List>
		<TeamModal team={team}
		           updateTeam={updateTeam}
		           deleteTeam={deleteTeam}
		           setTeamModal={setTeamModal}
		           activeModal={activeModal}/>
	</div>
)

export default NamePopup;