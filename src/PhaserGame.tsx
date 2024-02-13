import React, { useEffect, useRef } from "react";
import Phaser from "phaser";

class MainScene extends Phaser.Scene {
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  player: any;
  spaceKey: any;
  constructor() {
    super({ key: "MainScene" });
  }
  preload() {
    this.load.spritesheet(
      "OakWoodsFloor",
      "./oak_woods_v1.0/oak_woods_tileset.png",
      {
        frameWidth: 24, // Width of a single frame
        frameHeight: 24, // Height of a single frame
        // If there are margins or spacing in your sprite sheet, you can specify them here as well
      }
    );
    this.load.spritesheet(
      "OakWoodsPlayer",
      "./oak_woods_v1.0/character/char_blue.png",
      {
        frameWidth: 56, // Width of a single frame
        frameHeight: 56, // Height of a single frame
        // If there are margins or spacing in your sprite sheet, you can specify them here as well
      }
    );
    this.load.image(
      "background",
      "./oak_woods_v1.0/background/background_layer_1.png"
    );
  }

  create(scene: Phaser.Scene) {
    const bg = this.add.image(400, 300, "background");
    bg.setScale(this.scale.width / bg.width);
    const platform = this.add.tileSprite(
      0,
      (this.game.config.height as number) - 60,
      this.game.config.width as number,
      20,
      "OakWoodsFloor",
      1
    );
    platform.setOrigin(0, 1);

    const platforms = this.physics.add.staticGroup();
    platforms.add(platform);
    this.player = this.physics.add.sprite(100, 450, "OakWoodsPlayer", 0);
    // Create player
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    // Enable collision between the player and the platforms
    this.physics.add.collider(this.player, platforms);
    // Attach to the scene for later use
    if (this.input) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.spaceKey = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE
      );
    }
    this.anims.create({
      key: "idle", // The key for this animation
      frames: this.anims.generateFrameNumbers("OakWoodsPlayer", {
        start: 0,
        end: 5,
      }), // Frames for the idle animation
      frameRate: 10, // Speed of the animation
      repeat: -1, // Loop the animation
    });

    this.anims.create({
      key: "walk-left", // The key for this animation

      frames: this.anims.generateFrameNumbers("OakWoodsPlayer", {
        start: 16,
        end: 23,
      }), // Frames for the idle animation
      frameRate: 10, // Speed of the animation
      repeat: -1, // Loop the animation
    });
    this.anims.create({
      key: "walk-right", // The key for this animation
      frames: this.anims.generateFrameNumbers("OakWoodsPlayer", {
        start: 16,
        end: 23,
      }), // Frames for the idle animation
      frameRate: 10, // Speed of the animation
      repeat: -1, // Loop the animation
    });
    this.anims.create({
      key: "jump", // The key for this animation
      frames: this.anims.generateFrameNumbers("OakWoodsPlayer", {
        start: 25,
        end: 33,
      }), // Frames for the idle animation
      frameRate: 10, // Speed of the animation
      repeat: -1, // Loop the animation
    });
    this.anims.create({
      key: "fall", // The key for this animation
      frames: this.anims.generateFrameNumbers("OakWoodsPlayer", {
        start: 34,
        end: 40,
      }), // Frames for the idle animation
      frameRate: 10, // Speed of the animation
      repeat: -1, // Loop the animation
    });
    this.anims.create({
      key: "attack", // The key for this animation
      frames: this.anims.generateFrameNumbers("OakWoodsPlayer", {
        start: 8,
        end: 13,
      }), // Frames for the idle animation
      frameRate: 20, // Speed of the animation
      repeat: 0, // Loop the animation
    });
    this.player.on(
      "animationcomplete",
      (anim: any) => {
        if (anim.key === "jump") {
          // Assuming the player is still in the air after jump completes
          this.player.anims.play("fall", true);
        }
      },
      this
    );
    this.player.on(
      "animationcomplete",
      () => {
        this.player.isAttacking = false;
      },
      this
    );
    this.player.isJumping = false;
  }

  update() {
    if (!this.player.isAttacking) {
      if (this.cursors.left.isDown) {
        this.player.setFlipX(true);
        this.player.anims.play("walk-left", true);
        this.player.setVelocityX(-160); // Adjust speed as needed
      } else if (this.cursors.right.isDown) {
        this.player.anims.play("walk-right", true);
        this.player.setFlipX(false);
        this.player.setVelocityX(160); // Adjust speed as needed
      } else {
        this.player.anims.play("idle", true);
        this.player.setVelocityX(0);
      }
      if (
        Phaser.Input.Keyboard.JustDown(this.cursors.up) &&
        this.player.body.touching.down
      ) {
        this.player.setVelocityY(-330); // Adjust for desired jump strength
        this.player.isJumping = true;
      }
      if (!this.player.body.touching.down && !this.player.isJumping) {
        this.player.anims.play("fall", true);
      }
      if (!this.player.body.touching.down && this.player.body.velocity.y > 0) {
        // Player is moving downwards, play the falling animation
        this.player.anims.play("fall", true);
      } else if (
        this.player.body.touching.down &&
        this.player.isJumping &&
        this.player.body.velocity.y > 0
      ) {
        // Player has landed, reset the jumping flag
        this.player.isJumping = false;
        // You can play the idle or walk animation here depending on movement
      }
      if (
        this.player.isJumping &&
        this.player.body.velocity.y < 0 &&
        !this.player.body.touching.down
      ) {
        this.player.anims.play("jump", true);
      }
    }

    if (
      Phaser.Input.Keyboard.JustDown(this.spaceKey) &&
      this.player.body.touching.down
    ) {
      this.player.isAttacking = true;
      this.player.anims.play("attack", true);
      this.player.setVelocityX(0);
    }
  }
}

const PhaserGame = () => {
  const gameRef = useRef(null);
  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: "phaser-container",
      backgroundColor: "#ffffff",
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 800 }, // Adjust gravity according to your game's needs
          debug: false,
        },
      },
      scene: [MainScene],
    };

    const game = new Phaser.Game(config);
    // Cleanup function to destroy the game when the component unmounts
    return () => {
      game.destroy(true, false);
    };
  }, []); // Empty dependency array ensures effect only runs once

  return <div id="phaser-container" />;
};

export default PhaserGame;
