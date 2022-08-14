import { ChangeEvent, FC, useRef, useState } from "react";
import Image from "next/image";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip, { tooltipClasses, TooltipProps } from "@mui/material/Tooltip";
import Slider from "@mui/material/Slider";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Zoom from "@mui/material/Zoom";
import Box from "@mui/material/Box";
import ArrowCircleDownIcon from "@mui/icons-material/ArrowCircleDown";
import FastForwardRounded from "@mui/icons-material/FastForwardRounded";
import FastRewindRounded from "@mui/icons-material/FastRewindRounded";
import PlayArrowRounded from "@mui/icons-material/PlayArrowRounded";
import PauseRounded from "@mui/icons-material/PauseRounded";
import { toBlob } from "html-to-image";
import saveAs from "file-saver";
import TextField from "@mui/material/TextField";
import ClickAwayListener from "@mui/material/ClickAwayListener";

type SongInfoProps = {
  name: string;
  singer: string;
  album: string;
  image: string;
  duration: number;
};

const LightTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.white,
    color: "rgba(0, 0, 0, 0.87)",
    boxShadow: theme.shadows[1],
    fontSize: 11,
  },
}));

const Widget = styled("div")(() => ({
  padding: 16,
  borderRadius: 8,
  width: 400,
  maxWidth: "100%",
  margin: "auto",
  position: "relative",
  zIndex: 1,
  backgroundColor: "transparent",
  backdropFilter: "blur(40px)",
}));

const TinyText = styled(Typography)({
  fontSize: "0.75rem",
  opacity: 0.38,
  fontWeight: 500,
  letterSpacing: 0.2,
});

const sliderSX = {
  color: "rgba(0,0,0,0.87)",
  height: 4,
  "& .MuiSlider-thumb": {
    width: 8,
    height: 8,
    transition: "0.3s cubic-bezier(.47,1.64,.41,.8)",
    "&:before": {
      boxShadow: "0 2px 12px 0 rgba(0,0,0,0.4)",
    },
    "&:hover, &.Mui-focusVisible": {
      boxShadow: "rgb(0 0 0 / 16%)",
    },
    "&.Mui-active": {
      width: 20,
      height: 20,
    },
  },
  "& .MuiSlider-rail": {
    opacity: 0.28,
  },
};

const defaultSong: SongInfoProps = {
  name: "Từ ngày em đến",
  singer: "Da Lab",
  album: "Single",
  image: "/images/songs/tungayemden.jpg",
  duration: 4 * 60 + 30,
};

const formatDuration = (value: number) => {
  const minute = Math.floor(value / 60);
  const secondLeft = value - minute * 60;
  return `${minute}:${secondLeft < 10 ? `0${secondLeft}` : secondLeft}`;
};

const validInput = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

const MusicPlayer: FC = () => {
  const imageRef = useRef(null);
  const [position, setPosition] = useState(60 + 8);
  const [paused, setPaused] = useState(false);
  const [song, setSong] = useState(defaultSong);
  const [durationInput, setDurationInput] = useState<string>(
    formatDuration(defaultSong.duration)
  );
  const [openedChangeDurationModal, setOpenedChangeDurationModal] =
    useState(false);

  const handleDownload = () => {
    if (imageRef.current != null)
      toBlob(imageRef.current as HTMLElement).then((blob) => {
        saveAs(blob as Blob, "music-tag.png");
      });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSong((prev) => ({
        ...prev,
        image: URL.createObjectURL(file),
      }));
    }
  };

  const openChangeDurationModal = () => setOpenedChangeDurationModal(true);
  const closeChangeDurationModal = () => setOpenedChangeDurationModal(false);

  const handleValidationDurationInput = () => {
    const times = durationInput.split(":");
    const twoColonOnly = times.length == 2;
    const [hours, minutes] = times;
    const hoursInvalid = typeof +hours != "number" || +hours > 99 || +hours < 0;
    const minutesInvalid =
      typeof +minutes != "number" || +minutes > 59 || +minutes < 0;

    const isValid = twoColonOnly && !hoursInvalid && !minutesInvalid;
    return isValid;
  };

  const handleChangeDurationInput = ({
    target: { value },
  }: ChangeEvent<HTMLInputElement>) => {
    const invalid = value.split("").some((char) => !validInput.includes(char));
    if (invalid) return;
    if (value.length == 2 && !value.includes(":"))
      setDurationInput(value + ":");
    else setDurationInput(value.slice(0, 5));
  };

  const handleChangeDuration = () => {
    const isValid = handleValidationDurationInput();
    if (!isValid) setDurationInput(formatDuration(defaultSong.duration));
    else {
      const [hours, minutes] = durationInput.split(":");
      const newDuration = +hours * 60 + +minutes;
      setSong((prev) => ({ ...prev, duration: newDuration }));
    }
    closeChangeDurationModal();
  };

  return (
    <Stack spacing={2} direction="column">
      <div className="box-shadow rounded">
        <Widget ref={imageRef}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Tooltip
              title="Change Image"
              placement="top"
              TransitionComponent={Zoom}
            >
              <label className="relative cursor-pointer">
                <input
                  type="file"
                  accept=".jpg, .jpeg, .png"
                  onChange={handleImageChange}
                  hidden
                />
                <Image
                  className="rounded"
                  src={song.image}
                  width={100}
                  height={100}
                  objectFit="cover"
                />
              </label>
            </Tooltip>
            <Box ml={1.5}>
              <Typography noWrap fontSize={20} fontWeight={600}>
                <span contentEditable>{song.name}</span>
              </Typography>
              <Typography noWrap letterSpacing={-0.25}>
                <span contentEditable>{song.singer}</span>
              </Typography>
              <Typography noWrap letterSpacing={-0.25}>
                <span contentEditable>{song.album}</span>
              </Typography>
            </Box>
          </Box>
          <Slider
            aria-label="time-indicator"
            size="small"
            value={position}
            min={0}
            step={1}
            max={song.duration}
            onChange={(_, value) => setPosition(value as number)}
            sx={sliderSX}
          />
          <Stack
            alignContent="center"
            justifyContent="space-between"
            direction="row"
            mt={-2}
          >
            <TinyText>{formatDuration(position)}</TinyText>
            <LightTooltip
              placement="right"
              TransitionComponent={Zoom}
              open={openedChangeDurationModal}
              title={
                <ClickAwayListener onClickAway={handleChangeDuration}>
                  <TextField
                    autoFocus
                    variant="standard"
                    size="small"
                    type="text"
                    sx={{ width: 50, outline: "none" }}
                    placeholder="13:08"
                    value={durationInput}
                    onChange={handleChangeDurationInput}
                    onKeyUp={({ key }) => {
                      switch (key) {
                        case "Enter":
                          handleChangeDuration();
                          break;
                        case "Backspace":
                          setDurationInput(durationInput.slice(0, -1));
                          break;
                      }
                    }}
                  />
                </ClickAwayListener>
              }
            >
              <TinyText
                onClick={openChangeDurationModal}
                sx={{ userSelect: "none" }}
              >
                -{formatDuration(song.duration - position)}
              </TinyText>
            </LightTooltip>
          </Stack>
          <Stack
            alignContent="center"
            justifyContent="center"
            direction="row"
            mt={-1}
          >
            <IconButton aria-label="previous song">
              <FastRewindRounded fontSize="large" htmlColor="black" />
            </IconButton>
            <IconButton
              aria-label={paused ? "play" : "pause"}
              onClick={() => setPaused(!paused)}
              sx={{ fontSize: "3rem" }}
            >
              {paused ? (
                <PlayArrowRounded fontSize="inherit" htmlColor="black" />
              ) : (
                <PauseRounded fontSize="inherit" htmlColor="black" />
              )}
            </IconButton>
            <IconButton aria-label="next song">
              <FastForwardRounded fontSize="large" htmlColor="black" />
            </IconButton>
          </Stack>
        </Widget>
      </div>
      <Button onClick={handleDownload} endIcon={<ArrowCircleDownIcon />}>
        Download Transparent Image
      </Button>
    </Stack>
  );
};

export default MusicPlayer;
