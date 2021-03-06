import React, { Component } from 'react'
import {Button,
        Row,
        Col,
        InputGroup,
        Card,
        FormControl,
        Form,
        Alert
} from 'react-bootstrap';

import PreviewModal from "./PreviewModal";
import moment from 'moment'
import {X} from "react-bootstrap-icons";

import store from './store.js';


class Home extends Component {
    constructor(props) {
        super(props)

        this.state = { account: '',
            previewModalShow: false,
            deposit:0,
            duration:0,
            currency:'XTZ',
            currencyConversion: 1,
            returnRate: 0.01,
            unlockDate: moment(Date.now()).add(3, 'months').calendar(),
            months:3,
            showAlert:false
        }
    }


    hideModals(){
        this.setState({previewModalShow: false, })
        this.forceUpdate();
    }


    setReturnRate(e){
        var startDate = Date.now();
        var endDateMoment = moment(startDate);


        if(e==='3 Months'){

            this.setState({returnRate: 0.01, months:3, unlockDate:endDateMoment.add(3, 'months').calendar() })
        }
        else if(e==='6 Months'){
            this.setState({returnRate: 0.021, months:6, unlockDate:endDateMoment.add(6, 'months').calendar()})
        }
        else if(e==='9 Months'){
            this.setState({returnRate: 0.033, months:9, unlockDate:endDateMoment.add(9, 'months').calendar()})
        }
        else if(e==='1 Year'){
            this.setState({returnRate: 0.0406, months:12, unlockDate:endDateMoment.add(12, 'months').calendar()})
        }
        else if(e==='15 Months'){
            this.setState({returnRate: 0.0510, months:15, unlockDate:endDateMoment.add(15, 'months').calendar()})
        }
        else if(e==='18 Months'){
            this.setState({returnRate: 0.0615, months:18, unlockDate:endDateMoment.add(18, 'months').calendar()})
        }
        else if(e==='21 Months'){
            this.setState({returnRate: 0.0721, months:21, unlockDate:endDateMoment.add(21, 'months').calendar()})
        }
        else{
            this.setState({returnRate: 0.0829, months:24, unlockDate:endDateMoment.add(24, 'months').calendar()})
        }

    }

    chooseCurrency(e){
        let conversion;

        if(e === 'USDtz'){
            conversion = 0.34;
        }
        else if (e === 'tzBTC'){
            conversion = 0.00030026;
        }
        else{
            conversion = 1;
        }

        this.setState({currency:e, currencyConversion:conversion});
    }


    render() {
        return (
            <div>
                <div style={{display:"flex", alignItems:'flex-end', flexDirection:'column', marginRight:10}}>
                    <a  style={{fontWeight:'bold', fontSize:16, color:'slate'}}
                        href={`https://carthagenet.tzstats.com/${store.publicAddress}`}
                        target="_blank"
                    >
                        {store.publicAddress}
                    </a>
                    <p style={{fontWeight:'bold', fontSize:16, color:'slate'}}>{store.userMetadata.email}</p>
                </div>
                <div style={{display:'flex', justifyContent:'center'}}>
                    <p style={{fontWeight:'bold', fontSize:44, color:'DodgerBlue',
                        textShadow: "2px 4px 3px rgba(0,0,0,0.3)" }}>Seize Your Stake</p>
                </div>
                <Row style={{marginTop:0}}>
                    <Col style={{display:'flex', justifyContent:'center'}}>
                        <Card style={{width:500, boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}}>
                            <Card.Body style={{padding:40}}>
                                <Form style={{marginTop:-15}}>
                                    <Form.Group controlId="deposit">
                                        <Form.Label style={{fontWeight:'bold', fontSize:16, color:'slate', }}>Deposit Amount</Form.Label>
                                        <InputGroup className="mb-3">
                                            <FormControl
                                                placeholder="0"
                                                aria-label="Deposit"
                                                aria-describedby="basic-addon1"
                                                onChange={(e)=> this.setState({deposit: e.target.value})}
                                            />
                                            <InputGroup.Append>
                                                <InputGroup.Text id="basic-addon2">XTZ</InputGroup.Text>
                                            </InputGroup.Append>
                                        </InputGroup>
                                    </Form.Group>

                                    <Form.Group controlId="duration" style={{marginTop:-10}}>
                                        <Form.Label style={{fontWeight:'bold', fontSize:16, color:'slate'}}>Lockup Period</Form.Label>
                                        <Form.Control as="select"
                                                      onChange={(e)=> this.setReturnRate(e.target.value)}>
                                            <option>3 Months</option>
                                            <option>6 Months</option>
                                            <option>9 Months</option>
                                            <option>1 Year</option>
                                            <option>15 Months</option>
                                            <option>18 Months</option>
                                            <option>21 Months</option>
                                            <option>2 Years</option>
                                        </Form.Control>
                                    </Form.Group>

                                    <Form.Group  controlId="currency" style={{marginTop:15}}>
                                        <Form.Label style={{fontWeight:'bold', fontSize:16, color:'slate'}}>  Return Currency</Form.Label>
                                        <Form.Control as="select"
                                                      onChange={(e)=> this.chooseCurrency(e.target.value)}>
                                            <option>XTZ</option>
                                            <option>USDtz (Coming Soon!)</option>
                                            <option>tzBTC (Coming Soon!)</option>
                                        </Form.Control>
                                    </Form.Group>

                                </Form>
                                <div style={{display:'flex', justifyContent:'center', marginTop:30}}>

                                    <Card style={{backgroundColor:'whitesmoke', width:'100%'}}>
                                        <Card.Body>

                                            <p style={{fontWeight:'bold', fontSize:16, color:'slate'}}>
                                                Return
                                            </p>
                                            <ul style={{fontSize:16, color:'slate', marginTop:-5}}>
                                                <li> { this.state.deposit*this.state.returnRate*this.state.currencyConversion } {this.state.currency} Stake </li>
                                                {
                                                    (this.state.unlockDate !== null)?
                                                        <li> Certificate redeemable for {this.state.deposit} XTX on {this.state.unlockDate}</li>
                                                        :
                                                        <div></div>
                                                }
                                            </ul>

                                        </Card.Body>
                                    </Card>
                                </div>
                                <div style={{display:'flex', justifyContent:'center', marginTop:30}}>
                                    <Button size="lg" onClick={() => this.setState({previewModalShow: true}) }> Get Stake Now </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
                <PreviewModal
                    show={this.state.previewModalShow}
                    onHide={() => this.hideModals()}
                    deposit={ this.state.deposit}
                    stake={ this.state.deposit*this.state.returnRate*this.state.currencyConversion }
                    currency={this.state.currency}
                    date={this.state.unlockDate}
                    months={this.state.months}
                />
                {
                    (this.state.showAlert)?
                        <div style={{
                            position: 'absolute',
                            top: '40% ',
                            right: '50%'
                        }}>
                        <Alert variant='danger'
                               style={{
                                   position: 'relative',
                                   right: '-50%'
                               }}>
                            <div style={{display:'flex', justifyContent:'flex-end'}}>
                                <X color="maroon" size={20} onClick={() => this.setState({showAlert:false})}/>
                            </div>
                            <p style={{display:'flex', justifyContent:'flex-start', marginTop:0, }}>
                                Insufficient funds. Try sending a smaller amount or replenish account balance.
                            </p>
                        </Alert>
                            </div>
                        :
                        <div></div>
                }
            </div>
        )
    }
}

export default Home