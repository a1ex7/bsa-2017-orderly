import React from 'react';
import { Popup, Icon, Input } from 'semantic-ui-react';

import './addTabBtn.scss';

let input;

const AddTabBtn = ({base, togglePopup, addPopupIsOpen, addTableClick}) => (
    <Popup trigger={<Icon inverted link name='plus square' size='large'/>}
        open={addPopupIsOpen}
        position='bottom left'
        on='click'
        onOpen={togglePopup}
        onClose={togglePopup}
        hideOnScroll>
            <Input icon={{ name: 'plus', link: true, onClick: () => {
                if (!input || !input.value) return;
                addTableClick({
                    table: {
                        name: input.value,
                        fields: [{
                            name: 'Primary field',
                            type: 'text',
                        }],
                        records: [{record_data: [{data: ''}]}]
                    },
                    baseId: base._id});
                input = '';
            }}}
            onChange={(event) => { input = event.target;}}
            type='text'
            placeholder='Add table...' />
    </Popup>
);

export default AddTabBtn;