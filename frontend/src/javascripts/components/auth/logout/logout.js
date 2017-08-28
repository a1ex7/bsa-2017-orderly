import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import {connect} from 'react-redux';
import * as LogoutActions from './logoutActions';

import socket from '../../../app/socketIO';

class Logout extends React.Component {

    componentWillMount(){
        socket.disconnect();
        // Redirect to login page if user is logged in
        this.props.logout();
    }

    render(){
        return null;
    }
}

Logout.propTypes = {
    logout: PropTypes.func.isRequired
};

function mapDispatchToProps(dispatch) {
    return bindActionCreators(Object.assign({}, LogoutActions),  dispatch);
}

export default connect(null, mapDispatchToProps)(Logout);