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
          <div className={colorChange ? "header colorChange" : "header"}>
            <div className="container">
              <div className="header-content-wrapper">
                <a href="/" className="site-logo" title="back to index">
                  {/* <img
              loading="lazy"
              width="200"
              src="http://babypunks.com/img/logo-primary.png"
              alt="babypunks"
            /> */}
                </a>

                <nav>
                  <ul
                    className="primary-menu-menu primary-menu-indented scrollable"
                    style={{ maxHeight: "460px", display: "inline-block" }}
                  >
                    <li className="menu-item-has-children">
                      <a title="NFT" href="#">
                        NFT<span className="indicator"></span>
                      </a>
                      <ul
                        className="sub-menu sub-menu-right"
                        style={{ display: "none" }}
                      >
                        <li className="menu-item-has-children">
                          <a title="MINT" href="#MINT" data-scroll="true">
                            MINT
                          </a>
                        </li>
                        <li className="menu-item-has-children">
                          <a title="story" href="#story" data-scroll="true">
                            Story
                          </a>
                        </li>
                        <li className="menu-item-has-children">
                          <a
                            title="roadmap"
                            href="#roadmap"
                            data-scroll="true"
                          >
                            Roadmap
                          </a>
                        </li>
                        <li className="menu-item-has-children">
                          <a title="team" href="#team" data-scroll="true">
                            Team
                          </a>
                        </li>
                      </ul>
                    </li>
                    <li className="menu-item-has-children">
                      <a title="buy" href="/">
                        BUY<span className="indicator"></span>
                      </a>
                      <ul
                        className="sub-menu sub-menu-right"
                        style={{ display: "none" }}
                      >
                        <li className="menu-item-has-children">
                          <a title="mint" href="/">
                            BUY NFT
                          </a>
                        </li>
                        <li className="menu-item-has-children">
                          <a title="" href="/">
                            BabyPunks Coin
                          </a>
                        </li>
                      </ul>
                    </li>
                    <li className="menu-item-has-children">
                      <a title="babypunkcoin" href="/">
                        BabyPunks Coin<span className="indicator"></span>
                      </a>
                      <ul
                        className="sub-menu sub-menu-right"
                        style={{ display: "none" }}
                      >
                        <li className="menu-item-has-children">
                          <a title="bpmint" href="/">
                            White paper
                          </a>
                        </li>
                        <li className="menu-item-has-children">
                          <a
                            title="Roadmap"
                            href="#roadmap"
                            data-scroll="true"
                          >
                            Roadmap
                          </a>
                        </li>
                        <li className="menu-item-has-children">
                          <a title="Audit" href="/">
                            Audit
                          </a>
                        </li>
                        <li className="menu-item-has-children">
                          <a title="BPCMarket" href="/">
                            Market
                          </a>
                        </li>
                      </ul>
                    </li>
                    <li className="menu-item-has-children">
                      <a title="Market" href="/">
                        Market<span className="indicator"></span>
                      </a>
                      <ul
                        className="sub-menu sub-menu-right"
                        style={{ display: "none" }}
                      >
                        <li className="menu-item-has-children">
                          <a
                            title="coinmarket"
                            target="_blank"
                            href="https://coinmarketcap.com/currencies/babypunks/"
                            rel="noreferrer"
                          >
                            Coinmarketcap
                          </a>
                        </li>
                        <li className="menu-item-has-children">
                          <a
                            title="coingecko"
                            target="_blank"
                            href="https://www.coingecko.com/en/coins/babypunks"
                            rel="noreferrer"
                          >
                            Coingecko
                          </a>
                        </li>
                      </ul>
                    </li>

                    <li className="menu-item-has-children">
                      <a href="/">
                        Socialmedia<span className="indicator"></span>
                      </a>
                      <ul
                        className="sub-menu sub-menu-right"
                        style={{ display: "none" }}
                      >
                        <li className="menu-item-has-children">
                          <a
                            aria-label="Twitter"
                            className="sc-1i4jqyq-0 dgglXh sc-1gbjr5k-6 jemGW"
                            href="https://twitter.com/BabyPunksCoin"
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            Twitter
                          </a>
                        </li>
                        <li className="menu-item-has-children">
                          <a
                            aria-label="Telegram"
                            className="sc-1i4jqyq-0 dgglXh sc-1gbjr5k-6 jemGW"
                            href="https://t.me/babypunkofficial"
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            Telegram
                          </a>
                        </li>
                        <li className="menu-item-has-children">
                          <a
                            rel="noopener noreferrer"
                            href="https://www.instagram.com/babypunkscoin"
                          >
                            Instagram
                          </a>
                        </li>
                        <li className="menu-item-has-children">
                          <a
                            rel="noopener noreferrer"
                            href="https://www.facebook.com/BabyPunksCoin"
                          >
                            Facebook
                          </a>
                        </li>
                        <li className="menu-item-has-children">
                          <a
                            rel="noopener noreferrer"
                            href="https://www.reddit.com/r/babypunksofficial"
                          >
                            Reddit
                          </a>
                        </li>
                        <li className="menu-item-has-children">
                          <a
                            rel="noopener noreferrer"
                            href="http://discord.gg/babypunks"
                          >
                            Discord
                          </a>
                        </li>
                      </ul>
                    </li>

                    <li>
                      {!wallet && (
                        <ConnectButton id="connectButton">
                        </ConnectButton>
                      )}

                      {wallet && (
                        <div className="connectedLabelDiv"><p className="connectedLabel">Connected: {shortenAddress(wallet.publicKey.toBase58() || "")}</p></div>
                      )}
                    </li>



                    {/* <button
                        // onClick={() => setShowModal(true)}
                        className="mint_btn"
                      >
                        <img
                          loading="lazy"
                          width="200"
                          height="80"
                          src="http://babypunks.com/img/pixel_button.png"
                          alt="babypunks"
                        />
                      </button> */}
                  </ul>
                </nav>
              </div>

              {/* <Modal onClose={() => setShowModal(false)} show={showModal} /> */}
            </div>
          </div>
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
                    <div className="col-lg-7 col-md-12 col-lg-offset-0 col-sm-12 col-xs-12">
                      <div style={{ marginBottom: "130px", textAlign: "center" }}>
                        <h3 style={{ marginTop: "1rem", textAlign: "center" }} >10,000 unique BabyPunks live on Solana</h3>

                        <p>
                          BabyPunks is a limited NFT collection on the Solana
                          blockchain.Supply is capped at 10,000.Your BabyPunks allow
                          you to earn 5% royalties paid in SOL tokens from every buy &
                          sell for life.
                        </p>

                        <p>
                          All BabyPunks are programmatically generated to include
                          numerous traits and rarity.Adopting a BabyPunk also gives
                          you access to features within our BabyPunk Arcade which will
                          feature a series of old school classic games similar to
                          Tetris, Flappy Bird, and more.
                        </p>

                        <p>
                          All BabyPunks will be revealed shortly after being minted
                          along with activating special community features based on
                          the roadmap.
                        </p>
                      </div>
                    </div>
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
                <div className="row">
                  <div className="col-lg-5 col-md-12 col-lg-offset-0 col-sm-12 col-xs-12">
                    <div className="widget w-distribution-ends">
                      <img loading="lazy" id="random2" src="http://babypunks.com/img/baby_illustration.png"
                        alt="babypunk ilustration" />
                    </div>
                  </div>
                  <div className="col-lg-7 col-md-12 col-lg-offset-0 col-sm-12 col-xs-12">
                    <div style={{ marginBottom: "130px" }}>

                      <h6>These pixel babies are not your average crypto NFT.</h6>

                      <p>
                        BabyPunks is a limited NFT collection on the Solana blockchain. Supply is capped at
                        10,000. Your BabyPunks allow you to earn 5% royalties paid in SOL tokens from every buy
                        & sell for life.
                      </p>

                      <p>
                        All BabyPunks are algorithmically generated from X amount of traits. Adopting a BabyPunk
                        also gives you access to features within our BabyPunk Arcade which will feature a series
                        of old school classic games similar to Tetris, Flappy Bird, and more.
                      </p>

                      <p>
                        All BabyPunks will be revealed shortly after being minted along with activating special
                        community features based on the roadmap.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </section>

            <section>
              <div id="" className="container text-center">
                <div className="col-md-12 col-sm-12 col-xs-12 mb-2">
                  <h1>
                    The Story
                  </h1>
                </div>
                <div className="row text-center" id="story">
                  <div className="row mb-5">
                    <img loading="lazy" src="http://babypunks.com/img/banner2.png" alt="storyImage" />
                  </div>
                  <div className="col-md-12 col-sm-12 col-xs-12 transparent">
                    <p>
                      BabyPunks are the spawn of what happens when you have a bunch of badass CryptoPunks mixed
                      with pop culture, internet memes and peyote.This lot are looking for a new home and are up
                      for adoption.They were originally going to find new homes on Ethereum, but it was too old,
                      congested and full of other babies who looked neglected.The BabyPunks banded together and
                      set a course for uncharted territory - Solana.It’s every pixel's dream and now they have
                      their chance at the big leagues.
                    </p>
                    <p>
                      All they need is the right person to take them under their wing and teach them the ropes.
                      These punks may be small but they have big dreams and their properties uniquely reflect who
                      they are and promise to reward their owners handsomely.
                    </p>
                  </div>
                </div>
              </div>
            </section>
            <section id="roadmap">
              <div className="container text-center">
                <div className="col-md-12 col-sm-12 col-xs-12 mb-4">
                  <h1>
                    Roadmap
                  </h1>
                </div>
              </div>
              <div className="container">
                <div className="container">
                  <div className="row">
                    <div className="col-12 col-lg-6">
                      <div className="road-content">
                        <div className="red-process20"></div>
                        <div className="road-detail">
                          <h4>20% Sold</h4>
                          <h6 className="red">NFT Giveaway</h6>
                          <p>A random airdrop of 20 NFTs to early community members in our discord.</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-lg-6">
                      <div className="road-content">
                        <div className="red-process40"></div>
                        <div className="road-detail">
                          <h4>40% Sold</h4>
                          <h6 className="red">BabyPunks 10x Baby Bonus</h6>
                          <p>On the 4000th sale, there will be a payout 10x the mint price in SOL to 4
                            community members in our discord.</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-lg-6">
                      <div className="road-content">
                        <div className="red-process50"></div>
                        <div className="road-detail">
                          <h4>50% Sold</h4>
                          <h6 className="red">BabyPunks Merch</h6>
                          <p>BabyPunks Merch store will be rolled out where NFT holders will get first dibs
                            and exclusive access to limited edition t-shirts, hats, and hoodies.Non-NFT
                            holders will be given access at a later date.</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-lg-6">
                      <div className="road-content">
                        <div className="red-process60"></div>
                        <div className="road-detail">
                          <h4>60% Sold</h4>
                          <h6 className="red">BabyPunks Sweeper</h6>
                          <p>A liquidity wallet will be created that will be used to buy the floor of BabyPunk
                            NFTs.</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-lg-6">
                      <div className="road-content">
                        <div className="red-process70"></div>
                        <div className="road-detail">
                          <h4>70% Sold</h4>
                          <h6 className="red">BabyPunks Gives Back</h6>
                          <p>The community will direct a $10,000 gift to a charity of the community's
                            choosing.
                            A grant of $15,000 will be set up to fund a community project that contributes
                            to the growth of BabyPunks.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-lg-6">
                      <div className="road-content">
                        <div className="red-process80"></div>
                        <div className="road-detail">
                          <h4>80% Sold</h4>
                          <h6 className="red">TeenPunks</h6>
                          <p>We will create a limited collection of stylized TeenPunks and airdrop them to all
                            holders.</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-lg-6">
                      <div className="road-content">
                        <div className="red-process100"></div>
                        <div className="road-detail">
                          <h4>100% Sold</h4>
                          <h6 className="red">The PUNK-A-TRON Arcade</h6>
                          <p>We will build an even bigger arcade than we planned for previously that will host
                            approximately 10 titles by the end of this year.The games will feature retro
                            old school classics.All NFT holders will be able to stake their NFTs to earn
                            BabyPunk Tokens from transaction fees paid by players to play the games to
                            compete head to head for prizes such popular NFTs, and SOL tokens.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <br />
            <br />
            <br />
            <section>
              <div id="team" className="container text-center">
                <div className="row">
                  <div className="col-lg-12 col-sm-12 col-xs-12 mb-5">
                    <h1>
                      The Team
                    </h1>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-3 col-sm-6 col-xs-12">
                    <img src="http://babypunks.com/img/baby_3.png" alt="dev" />
                    <p>
                      BabyPunkGuy
                    </p>
                    <p>
                      Dev
                    </p>
                  </div>
                  <div className="col-lg-3 col-sm-6 col-xs-12">
                    <img src="http://babypunks.com/img/baby_5.png" alt="smmark" />
                    <p>
                      Nefu
                    </p>
                    <p>
                      Social Media Marketing
                    </p>
                  </div>
                  <div className="col-lg-3 col-sm-6 col-xs-12">
                    <img src="http://babypunks.com/img/baby_7.png" alt="man" />
                    <p>
                      SK
                    </p>
                    <p>
                      Project Management
                    </p>
                  </div>
                  <div className="col-lg-3 col-sm-6 col-xs-12">
                    <img src="http://babypunks.com/img/baby_8.png" alt="marks" />
                    <p>
                      CaptainM00n
                    </p>
                    <p>
                      Marketing Strategy
                    </p>
                  </div>
                </div>
              </div>
            </section>

          </div>
          <section className="backgroundGradient">
            <div id="team" className="container text-center backgroundGradient">
              <div className="row">
                <div className="col-lg-12 col-sm-12 col-xs-12 mb-5">
                  <h3>BabyPunks</h3>
                  <h5>© All right reserved 2021.</h5>
                </div>
              </div>
            </div>
          </section>
        </>
      </MintContainer>

      <Snackbar
        open={alertState.open}
        autoHideDuration={6000}
        onClose={() => setAlertState({ ...alertState, open: false })}
      >
        <Alert
          onClose={() => setAlertState({ ...alertState, open: false })}
          severity={alertState.severity}
        >
          {alertState.message}
        </Alert>
      </Snackbar>
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
