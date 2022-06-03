import { useEffect, useState } from "react";
import styled from "styled-components";
import Countdown from "react-countdown";
import { Button, CircularProgress, Snackbar } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import React from "react";
import Collection from "./components/Collection";
import Nav from "./components/Nav";
import * as anchor from "@project-serum/anchor";
import Modal from 'react-modal';
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { WalletDialogButton } from "@solana/wallet-adapter-material-ui";
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import {
  CandyMachine,
  awaitTransactionSignatureConfirmation,
  getCandyMachineState,
  mintOneToken,
  shortenAddress,
} from "./candy-machine";
import FormDialog from "./components/MintDialog";

const ConnectButton = styled(WalletDialogButton)``;

const CounterText = styled.span``; // add your styles here

const MintContainer = styled.div``; // add your styles here

const MintButton = styled(Button)``; // add your styles here

export interface HomeProps {
  candyMachineId: anchor.web3.PublicKey;
  config: anchor.web3.PublicKey;
  connection: anchor.web3.Connection;
  startDate: number;
  treasury: anchor.web3.PublicKey;
  txTimeout: number;
}


let subtitle: any;


const ComponentDidMount = () => {

}

const Home = (props: HomeProps) => {
  const [balance, setBalance] = useState<number>();
  const [isActive, setIsActive] = useState(false); // true when countdown completes
  const [isSoldOut, setIsSoldOut] = useState(false); // true when items remaining is zero
  const [isMinting, setIsMinting] = useState(false); // true when user got to press MINT

  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: "",
    severity: undefined,
  });

  let selectedValue = " ";

  const [startDate, setStartDate] = useState(new Date(props.startDate));

  const wallet = useAnchorWallet();
  const [candyMachine, setCandyMachine] = useState<CandyMachine>();

  const connectButtonClick = async () => {
    const b = document.getElementById("connectButton")
    b?.click();
  }

  const [modalIsOpen, setIsOpen] = React.useState(false);

  function openModal() {
    setIsOpen(true);
  }

  function afterOpenModal() {
    subtitle.style.color = '#f00';
  }

  function closeModal() {
    setIsOpen(false);
  }


  const onMint = async () => {
    try {
      setIsMinting(true);
      if (wallet && candyMachine?.program) {

        let v = document.getElementById("mintamount")

        if (v) {
          const l = document.getElementById("mintamount")?.innerText;
          console.log(l)
        }

        const mintTxId = await mintOneToken(
          candyMachine,
          props.config,
          wallet.publicKey,
          props.treasury,
          1
        );

        
        const status = await awaitTransactionSignatureConfirmation(
          mintTxId,
          props.txTimeout,
          props.connection,
          "singleGossip",
          false
        );

        if (!status?.err) {
          setAlertState({
            open: true,
            message: "Congratulations! Mint succeeded!",
            severity: "success",
          });
        } else {
          setAlertState({
            open: true,
            message: "Mint failed! Please try again!",
            severity: "error",
          });
        }
      }
    } catch (error: any) {
      // TODO: blech:
      let message = error.msg || "Minting failed! Please try again!";
      if (!error.msg) {
        if (error.message.indexOf("0x138")) {
        } else if (error.message.indexOf("0x137")) {
          message = `SOLD OUT!`;
        } else if (error.message.indexOf("0x135")) {
          message = `Insufficient funds to mint. Please fund your wallet.`;
        }
      } else {
        if (error.code === 311) {
          message = `SOLD OUT!`;
          setIsSoldOut(true);
        } else if (error.code === 312) {
          message = `Minting period hasn't started yet.`;
        }
      }

      setAlertState({
        open: true,
        message,
        severity: "error",
      });
    } finally {
      if (wallet) {
        const balance = await props.connection.getBalance(wallet.publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      }
      setIsMinting(false);
    }
  };

  const onMints = async (num:Number) => {
    num = 20;
    for (let index = 0; index < num; index++) {
      await onMint();
    }
  }

  const generateRandomNumber = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min) + min);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      console.log('This will run every second!');



    }, 1000);
    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    (async () => {
      if (wallet) {
        const balance = await props.connection.getBalance(wallet.publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      }
    })();
  }, [wallet, props.connection]);

  useEffect(() => {
    (async () => {
      if (!wallet) return;

      const { candyMachine, goLiveDate, itemsRemaining } =
        await getCandyMachineState(
          wallet as anchor.Wallet,
          props.candyMachineId,
          props.connection
        );

      setIsSoldOut(itemsRemaining === 0);
      setStartDate(goLiveDate);
      setCandyMachine(candyMachine);
    })();
  }, [wallet, props.candyMachineId, props.connection]);

  const [colorChange, setColorchange] = useState(false);
  const changeNavbarColor = () => {
    if (window.scrollY >= 80) {
      setColorchange(true);
    } else {
      setColorchange(false);
    }
  };
  window.addEventListener("scroll", changeNavbarColor);


  const [open, setOpen] = React.useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };




  return (
    <main>
      <div>
        <Dialog className="text-center" open={open} onClose={handleClose}>
          <DialogTitle>Mint Ramdom NFT</DialogTitle>
          <DialogContent >

            <img
              id="ramdomBaby"
              loading="lazy"
              src="http://babypunks.com/img/baby_3.png"
              style={{ borderRadius: "16px" }}
              alt="header"
            />

            <TextField
              autoFocus
              margin="dense"
              id="mintamount"
              label="Mint amount"
              type="number"
              fullWidth
              variant="standard"
            />


            <div>

              {isMinting ? (
                <CircularProgress />
              ) : (
                <img onClick={wallet ? onMints : connectButtonClick}
                  className="randomImage"
                  loading="lazy"
                  id="random"
                  style={{ cursor: "pointer" }}
                  src="https://s3.eu-central-1.wasabisys.com/steleros/pixel_button.png"
                  alt="random nft"
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <MintContainer id="mintContainer">
        <>
          <div className="main-content-wrapper backgroundGradient">
            <section className="main-section medium-padding120 responsive-align-center">
              <div className="container">
                <div className="row">
                  <div
                    className="col-lg-6 col-md-6 col-lg-offset-0 col-sm-6 col-xs-6 ihdgua-0 bDorMw"
                    style={{ textAlign: "center" }}
                  >
                    <img
                      loading="lazy"
                      src="http://babypunks.com/img/logo-primary.png"
                      style={{ borderRadius: "16px" }}
                      alt="header"
                    />
                  </div>
                  <div className="row" id="MINT">
                    <div className="col-lg-5 col-md-12 col-lg-offset-0 col-sm-12 col-xs-12 text-center">
                      <div className="widget w-distribution-ends">
                        <img
                          className="randomImage"
                          loading="lazy"
                          id="random"
                          src="http://babypunks.com/img/random/2.png"
                          alt="random nft"
                        />
                        <img onClick={handleClickOpen}
                          className="randomImage mt-1"
                          loading="lazy"
                          id="random"
                          style={{ cursor: "pointer" }}
                          src="https://s3.eu-central-1.wasabisys.com/steleros/pixel_button.png"
                          alt="random nft"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </>
      </MintContainer>
    </main>
  );
};

interface AlertState {
  open: boolean;
  message: string;
  severity: "success" | "info" | "warning" | "error" | undefined;
}

const renderCounter = ({ days, hours, minutes, seconds, completed }: any) => {
  return (
    <CounterText>
      {hours} hours, {minutes} minutes, {seconds} seconds
    </CounterText>
  );
};

export default Home;
