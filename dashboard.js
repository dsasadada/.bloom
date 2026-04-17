    require('dotenv').config();
    const {
        Client,
        GatewayIntentBits,
        EmbedBuilder,
        ActionRowBuilder,
        ButtonBuilder,
        ButtonStyle,
        StringSelectMenuBuilder,
        StringSelectMenuOptionBuilder,
        PermissionsBitField,
        ChannelType,
        ModalBuilder,
        TextInputBuilder,
        TextInputStyle,
        TextDisplayBuilder, MessageFlags, SeparatorBuilder, SeparatorSpacingSize, SectionBuilder, ThumbnailBuilder, MediaGalleryBuilder, ContainerBuilder, AttachmentBuilder, FileBuilder, BaseSelectMenuBuilder,
        Message
    } = require('discord.js');

    const fs = require('fs');
    const path = require('path');   

    const TOKEN = process.env.TOKEN;

    const PANEL_CHANNEL_ID = '1491121826099626238';
    const TICKET_CATEGORY_ID = '1491121827869626448';
    const TRANSCRIPT_CHANNEL_ID = '1491121827613769814';

    const bannerUrl = 'https://media.discordapp.net/attachments/1491121827613769809/1493964528914792521/dashboard.png?ex=69e0e264&is=69df90e4&hm=f8912d3d5c76181370c4482b75e38666d8c8a68d1b0d11939f91a79f77693054&=&format=webp&quality=lossless&width=1768&height=530';
    const footerImageUrl = 'https://media.discordapp.net/attachments/1491121827613769809/1493964529619566642/footer.png?ex=69e0e264&is=69df90e4&hm=3369fb96d82e7528ab7964a056a91122616f66bc2c3f8008381aba8a279687fd&=&format=webp&quality=lossless&width=1768&height=105';

    const STAFF_ROLE_IDS = [
        '1491121825323811018',
        '1491121825273352340',
        '1491121825273352339',
    ];

    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.DirectMessages
        ]
    });

    client.once('ready', () => {
        console.log(`logged in as ${client.user.tag}`);
    });

    function isStaff(member) {
        return member.roles.cache.some(role => STAFF_ROLE_IDS.includes(role.id));
    }

    client.on('messageCreate', async (message) => {
        if (message.author.bot) return;
        if (message.content !== '-sendDashboard') return;

        const channel = await client.channels.fetch(PANEL_CHANNEL_ID).catch(() => null);
        if (!channel) return;

    const container = new ContainerBuilder()
        .setAccentColor(0x2d2d31)

        const mainImage = new MediaGalleryBuilder()
        .addItems([
            {
                media: {
                    url: bannerUrl
                }
            }
        ])
        container.addMediaGalleryComponents(mainImage)

        const text = new TextDisplayBuilder()
        .setContent(
            '## `📘` Dashboard\n\nWelcome to .bloom, where creativity and quality come together to help your ideas grow. We create custom designs tailored to your vision, giving your brand the identity it deserves. From logos and graphics to full branding packages, our team is committed to delivering clean, professional, and standout results every time. Use the available sections to explore server information, guidelines, and everything you need, all neatly organized and easy to access in one place.')
        container.addTextDisplayComponents(text)

        container.addSeparatorComponents(new SeparatorBuilder())

    const menu = new StringSelectMenuBuilder()
    .setCustomId('view_the_guidelines')
    .setPlaceholder('View our Guidelines')
    .addOptions(
        new StringSelectMenuOptionBuilder()
            .setLabel('Guidelines')
            .setValue('guidelines')
    );

    const menuRow = new ActionRowBuilder().addComponents(menu);
    container.addActionRowComponents(menuRow)

        const secondaryImage = new MediaGalleryBuilder()
        .addItems([
            {
                media: {
                    url: footerImageUrl
                }
            }
        ])
        container.addMediaGalleryComponents(secondaryImage)

        const separator = new SeparatorBuilder
        container.addSeparatorComponents(separator)

        container.addActionRowComponents(row =>
            row.addComponents(
        new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setEmoji('1493658256856453211')
        .setCustomId('help_button')
        .setLabel('Contact Support'),

        new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
.setLabel('Services')
.setURL('https://discord.com/channels/1491121825181208826/1491121826405814547')
            )
        );

        await channel.send({
            flags: MessageFlags.IsComponentsV2,
            components: [container]
        });
    });

    client.on('interactionCreate', async (interaction) => {

        if (interaction.isStringSelectMenu() && interaction.customId === 'view_the_guidelines') {
        const value = interaction.values[0];

        if (value === 'guidelines') {

            const container1 = new ContainerBuilder()
            .setAccentColor(0x6d1f2e)

            const other = new MediaGalleryBuilder()
            .addItems([
                {
                    media: {
                        url: bannerUrl
                    }
                }
            ])
            container1.addMediaGalleryComponents(other)

            const text1 = new TextDisplayBuilder()
            .setContent(
                `## Rules and Regulations
<:Person:1493603873708052681> Respect
Treat all members with kindness and professionalism. Harassment, discrimination, or any toxic behavior will not be tolerated.

<:Megaphone:1493662511273349291> Focused Topics
Keep discussions related to the design community. Use the correct channels to help keep everything organized and easy to navigate.

<:robot:1493663562202222784> Safe Content Only
Only share appropriate content for all audiences. No explicit, harmful, offensive material, or unsafe/suspicious links.

<:Thumbtack:1493662910340268264> Moderator Discretion
Staff may take action when necessary to maintain a positive environment, even in cases not directly listed in the rules. Always use good judgment.

<:Book:1493663248472346694> Discord Guidelines
All members must follow Discord’s Terms of Service at all times to keep the server safe and compliant.`
            )
            container1.addTextDisplayComponents(text1)

            const separator1 = new SeparatorBuilder()
            container1.addSeparatorComponents(separator1)

            const footing = new MediaGalleryBuilder()
            .addItems([
                {
                    media: {
                        url: footerImageUrl
                    }
                }
            ])
            container1.addMediaGalleryComponents(footing)


            return interaction.reply({ flags: MessageFlags.IsComponentsV2, components: [container1], ephemeral: true });
        }
    }

    if (interaction.isButton() && interaction.customId === 'help_button') {
    const modal = new ModalBuilder()
        .setCustomId('help_reason_modal')
        .setTitle('Create Support Ticket');

    const reasonInput = new TextInputBuilder()
        .setCustomId('ticket_reason')
        .setLabel('Reason')
        .setPlaceholder('Describe your issue or request...')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

    const row = new ActionRowBuilder().addComponents(reasonInput);
    modal.addComponents(row);

    return interaction.showModal(modal);
    } if (interaction.isModalSubmit() && interaction.customId === 'help_reason_modal') {
    const guild = interaction.guild;
    const user = interaction.user;
    const reason = interaction.fields.getTextInputValue('ticket_reason');

    const channelName = `help-${user.username}`.toLowerCase();

    const channel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: TICKET_CATEGORY_ID,
        topic: `REASON:${reason}`,
        permissionOverwrites: [
        { id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
        ...STAFF_ROLE_IDS.map(id => ({
            id,
            allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory
            ]
        }))
        ]
    });


    const container = new ContainerBuilder()
        .setAccentColor(0x2d2d31)

            const text1 = new TextDisplayBuilder()
            .setContent(
            `<@${user.id}> | @here`)
            container.addTextDisplayComponents(text1)

        const mainImage = new MediaGalleryBuilder()
        .addItems([
            {
                media: {
                    url: bannerUrl
                }
            }
        ])
        container.addMediaGalleryComponents(mainImage)

        const text = new TextDisplayBuilder()
        .setContent(
            `A member of our team will be with you shortly. \n\n**Reason:**\n\`\`\`${reason}\`\`\``)
        container.addTextDisplayComponents(text)

        const secondary = new MediaGalleryBuilder()
        .addItems([
            {
                media: {
                    url: footerImageUrl
                }
            }
        ])
        container.addMediaGalleryComponents(secondary)

        const separator1 = new SeparatorBuilder()
        container.addSeparatorComponents(separator1)

        container.addActionRowComponents(row =>
            row.addComponents(
        new ButtonBuilder()
        .setCustomId('support_toggle_claim')
        .setLabel('Claim')
        .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
        .setCustomId('support_close')
        .setLabel('Close')
        .setStyle(ButtonStyle.Secondary)

            )
        )

    await channel.send({
        flags: MessageFlags.IsComponentsV2,
        components: [container]
    });

    return interaction.reply({
        content: `Your support ticket has been created: ${channel}`,
        ephemeral: true
    });
    }


    if (interaction.customId === 'application_button') {
        const user = interaction.user;

        await interaction.reply({
            content: 'Application sent to DMs.',
            ephemeral: true
        });

        try {
            await user.createDM();
            await sendDesignerApplication(user);
        } catch (error) {
            await interaction.editReply({
                content: 'I could not DM you, make sure you haven\'t blocked the bot or if you have disabled your DMs, please enable them.'
            });
            console.log(`Failed to DM ${user.tag}:`, error);
        }

        return;
    }

        if (!interaction.isButton() && !interaction.isModalSubmit()) return;

    if (interaction.isButton() && interaction.customId === 'support_toggle_claim') {

const topic = interaction.channel.topic || ""; 

const match = topic.match(/REASON:(.*)/i);
const reason = match ? match[1].trim() : "No reason provided";

        if (!isStaff(interaction.member)) {
            return interaction.reply({ content: 'Only staff members can use ticket controls.', ephemeral: true });
        }

        const channel = interaction.channel;
        const user = interaction.user;

        const currentLabel = interaction.component.label;
        let newLabel, claimerId;

        if (currentLabel === 'Claim') {
            newLabel = 'Unclaim';
            claimerId = user.id;
        } else {
            newLabel = 'Claim';
            claimerId = user.id;
        }

        const container = new ContainerBuilder().setAccentColor(0x2d2d31);

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`<@${claimerId || 'none'}> | <@&1455538269474521150>`)
        );

        container.addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems([{ media: { url: bannerUrl } }])
        );

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `A member of our team will be with you shortly. \n\n**Reason:**\n\`\`\`${reason}\`\`\``
            )
        );

        container.addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems([{ media: { url: footerImageUrl } }])
        );

        container.addSeparatorComponents(new SeparatorBuilder());

        container.addActionRowComponents(row =>
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId('support_toggle_claim')
                    .setLabel(newLabel)
                    .setStyle(ButtonStyle.Secondary),

                    new ButtonBuilder()
                    .setCustomId('support_close')
                    .setLabel('Close')
                    .setStyle(ButtonStyle.Secondary)
            )
        );

        return interaction.update({
            components: [container]
        });
    }

    if (interaction.customId === 'support_close') {

        const channel = interaction.channel;

        interaction.reply({ content: 'Confirm your close.', ephemeral: true })

        const confirmBtn = new ButtonBuilder()
            .setCustomId('cancel_close')
            .setLabel('Cancel Close')
            .setStyle(ButtonStyle.Danger)

        const closeConfirmRow = new ActionRowBuilder().addComponents(confirmBtn);

        const confirmEmbed = new EmbedBuilder()
            .setColor('#2d2d31')
            .setTitle('Cancel Close Ticket')
            .setDescription('Are you sure you want to close this ticket? Ticket will close in 15 seconds unless canceled..');

        const confirmMessage = await channel.send({ embeds: [confirmEmbed], components: [closeConfirmRow], ephemeral: false });

        const timeout = setTimeout(async () => {
            await confirmMessage.delete().catch(() => null);

            const messages = await channel.messages.fetch({ limit: 100 });
            const formattedMessages = messages
                .reverse()
                .map(m => {
                    const time = new Date(m.createdTimestamp).toLocaleString();
                    const content = m.content || '[No text content]';
                    return `
                    <div class="message">
                        <span class="time">[${time}]</span>
                        <span class="author">${m.author.tag}</span>:
                        <span class="content">${content}</span>
                    </div>`;
                })
                .join('');

            const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <title>Transcript - ${channel.name}</title>
    <style>
    body { background: #2c2f33; color: #dcddde; font-family: Arial, sans-serif; padding: 20px; }
    h1 { color: #ffffff; }
    .message { margin-bottom: 6px; }
    .time { color: #72767d; margin-right: 6px; }
    .author { color: #57f287; font-weight: bold; }
    .content { color: #dcddde; }
    </style>
    </head>
    <body>
    <h1>Transcript for #${channel.name}</h1>
    ${formattedMessages || '<p>No messages.</p>'}
    </body>
    </html>`;

            const fileName = `transcript-${channel.id}.html`;
            const filePath = path.join(__dirname, fileName);

            fs.writeFileSync(filePath, html);

            const logChannel = await client.channels.fetch(TRANSCRIPT_CHANNEL_ID).catch(() => null);
            if (logChannel) {
                await logChannel.send({
                    content: `Transcript for ${channel.name}`,
                    files: [filePath]
                });
            }

            fs.unlinkSync(filePath);
            await channel.delete().catch(() => null);
        }, 15000); 

        const collector = confirmMessage.createMessageComponentCollector({ time: 15000 });

        collector.on('collect', async i => {
            if (i.customId === 'cancel_close') {
                clearTimeout(timeout); 
                await i.update({ content: 'Ticket close cancelled.', embeds: [], components: [] });
            }
        });
    }
    });

    const color = '#2d2d31'
    const STAFF_CHANNEL_ID = 'APPLICATIONS_CHANNEL_ID'

    async function sendDesignerApplication(user) {
        const dmChannel = await user.createDM();

        const confirmationEmbed = new EmbedBuilder()
            .setColor(color)
            .setTitle('Thank you for sharing an interest in our Creative Team')
            .setDescription("We're thrilled to see your enthusiasm for joining our talented creative team!")
            .setImage(footerImageUrl);

        const yesButton = new ButtonBuilder()
            .setCustomId('yes_application')
            .setLabel('Start Application')
            .setStyle(ButtonStyle.Secondary);

        const noButton = new ButtonBuilder()
            .setCustomId('no_application')
            .setLabel('Cancel Application')
            .setStyle(ButtonStyle.Danger);

        const disabledYes = new ButtonBuilder()
            .setCustomId('yes_app')
            .setLabel('Start Application')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true);

        const disabledNo = new ButtonBuilder()
            .setCustomId('no_app')
            .setLabel('Cancel Application')
            .setStyle(ButtonStyle.Danger)
            .setDisabled(true);

        const row = new ActionRowBuilder().addComponents(yesButton, noButton);
        const disabledRow = new ActionRowBuilder().addComponents(disabledYes, disabledNo);

        try {
            const message = await dmChannel.send({ embeds: [confirmationEmbed], components: [row] });

            const filter = i => i.user.id === user.id;
            const collector = dmChannel.createMessageComponentCollector({ filter, max: 1, time: 30000 });

            collector.on('collect', async interaction => {
                if (interaction.customId === 'yes_application') {
                    await interaction.reply({ content: 'You have chosen to proceed with the application.', ephemeral: true });
                    await message.edit({ components: [disabledRow] });
                    await startApplicationQuestions(user, dmChannel);
                } else if (interaction.customId === 'no_application') {
                    await interaction.reply({ content: 'You have declined the application. The process will be canceled.', ephemeral: true });
                    await message.delete();
                }
            });

            collector.on('end', collected => {
                if (collected.size === 0) dmChannel.send('The application process has timed out. Please try again later.');
            });

        } catch (error) {
            console.error("Failed to create DM channel:", error);
        }
    }

    async function startApplicationQuestions(user, dmChannel) {
        const questions = [
            "What do you design?",
            "Show your past work. (bulk images only)",
            "What methods do you use to keep up with the latest design trends and enhance your skills?",
            "How long have you been designing?",
            "What inspires you to become a part of our design team?",
            "What timezone are you in?",
            "How many hours per week can you provide as a designer?"
        ];

        let answers = [];



        for (let i = 0; i < questions.length; i++) {

                    const contain = new ContainerBuilder()
        .setAccentColor(0x2d2d31)

        contain.addTextDisplayComponents(new TextDisplayBuilder().setContent(
            `**${questions[i]}**`
        ))

        contain.addMediaGalleryComponents(new MediaGalleryBuilder().addItems([
            {
                media: {
                    url: footerImageUrl
                }
            }
        ]))

            await dmChannel.send({ flags: MessageFlags.IsComponentsV2, components: [contain] });
            const collected = await dmChannel.awaitMessages({
                filter: m => m.author.id === user.id,
                max: 1,
                time: 600000,
                errors: ['time']
            }).catch(() => null);

            if (!collected || collected.size === 0) {
                await dmChannel.send("Application timed out. Please restart the application.");
                return;
            }

            const message = collected.first();

            if (i === 1) {
                const images = [];
                message.attachments.forEach(att => {
                    if (att.contentType && att.contentType.startsWith('image/')) images.push(att.url);
                });
                answers.push(images.length > 0 ? images.join(', ') : "No images provided.");
            } else {
                answers.push(message.content);
            }
        }

        const resultEmbed = new EmbedBuilder()
            .setColor(color)
            .setTitle('Application Submitted')
            .setDescription('Your responses have been recorded. ')
            .setImage(footerImageUrl);

        await user.send({ embeds: [resultEmbed] });

        const staffChannel = client.channels.cache.get(STAFF_CHANNEL_ID);
        if (!staffChannel) return;

        const container = new ContainerBuilder()
        .setAccentColor(0x2d2d31)

            const text1 = new TextDisplayBuilder()
            .setContent(
            `@everyone | **@${user.tag}'s** application`)
            container.addTextDisplayComponents(text1)

        const mainImage = new MediaGalleryBuilder()
        .addItems([
            {
                media: {
                    url: bannerUrl
                }
            }
        ])
        container.addMediaGalleryComponents(mainImage)

    const applicationText = new TextDisplayBuilder()
        .setContent(
            `**What designer fields do you specialise in?**\n\`\`\`\n${answers[0]}\n\`\`\`\n` +
            `**What methods do you use to keep up with the latest design trends and enhance your skills?**\n\`\`\`\n${answers[2]}\n\`\`\`\n` +
            `**How long have you been designing?**\n\`\`\`\n${answers[3]}\n\`\`\`\n` +
            `**What inspires you to become a part of our design team?**\n\`\`\`\n${answers[4]}\n\`\`\`\n` +
            `**What timezone are you in?**\n\`\`\`\n${answers[5]}\n\`\`\`\n` +
            `**How many hours per week can you provide as a designer?**\n\`\`\`\n${answers[6]}\n\`\`\``
        );

    container.addTextDisplayComponents(applicationText);

        const secondary = new MediaGalleryBuilder()
        .addItems([
            {
                media: {
                    url: footerImageUrl
                }
            }
        ])
        container.addMediaGalleryComponents(secondary)

        const separator1 = new SeparatorBuilder()
        container.addSeparatorComponents(separator1)

        container.addActionRowComponents(row =>
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId('application_accept')
                    .setLabel('Accept')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('application_deny')
                    .setLabel('Deny')
                    .setStyle(ButtonStyle.Secondary)

            )
        )

        const applicationSend = await staffChannel.send({ flags: MessageFlags.IsComponentsV2, components: [container] });

        const thread = await applicationSend.startThread({
            name: `Reviewing Process`,
            autoArchiveDuration: 60,
            reason: 'Review and Past work',
        });

        if (answers[1] && answers[1] !== "No images provided.") {
            const imageUrls = answers[1].split(', ');
            for (const url of imageUrls) {
                await thread.send({ content: url });
            }
        } else {
            await thread.send({ content: "No past work provided." });
        }
    }

    client.on('interactionCreate', async interaction => {
        if (!interaction.isButton() && !interaction.isModalSubmit()) return;

        const staffMember = interaction.user;
        const container = interaction.message.components[0]; 
        const thread = interaction.message.thread;

        let userId = null;
        if (thread) {
            const match = thread.name.match(/<@!?(\d+)>/);
            userId = match ? match[1] : null;
        }

        const member = userId ? await interaction.guild.members.fetch(userId).catch(() => null) : null;
    if (interaction.isButton() && interaction.customId === 'application_accept') {
        if (!member) return interaction.reply({ content: 'User not found.', ephemeral: true });

        try {

            await member.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(color)
                        .setTitle('Creative Team Application Accepted!')
                        .setDescription(
                            'You have been **accepted** into the Creative Team.'
                        )
                        .setImage(footerImageUrl)
                ]
            }).catch(() => null);

    function findButtonRows(node) {
        const results = [];

        if (node?.data?.type === 1 && Array.isArray(node.components)) {
            results.push(node);
        }

        if (Array.isArray(node?.components)) {
            for (const child of node.components) {
                results.push(...findButtonRows(child));
            }
        }

        return results;
    }

    const components = interaction.message.components;
    const buttonRows = components.flatMap(findButtonRows);

    if (!buttonRows.length) {
        console.warn('No button rows found in component tree');
        return;
    }

    const updatedComponents = components.map(root =>
        traverseAndReplace(root, node => {
            if (node?.data?.type === 1) {
                return new ActionRowBuilder().addComponents(
                    node.components.map(btn =>
                        ButtonBuilder.from(btn).setDisabled(true)
                    )
                );
            }
            return node;
        })
    );

    function traverseAndReplace(node, replacer) {
        const replaced = replacer(node);
        if (replaced !== node) return replaced;

        if (Array.isArray(node?.components)) {
            node.components = node.components.map(child =>
                traverseAndReplace(child, replacer)
            );
        }
        return node;
    }

    await interaction.update({ components: updatedComponents });

            if (thread) {
                await thread.send(`**<@${member.id}>**'s application has been **accepted** by **${staffMember.tag}**.`);
                await thread.setLocked(true, 'Application reviewed');
            }
        } catch {
            return interaction.reply({ content: 'Failed to accept application.', ephemeral: true });
        }
    }

    if (interaction.isButton() && interaction.customId === 'application_deny') {
        const modal = new ModalBuilder()
            .setCustomId('deny_modal')
            .setTitle('Provide Denial Reason')
            .addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('deny_reason')
                        .setLabel('Reason For Denial')
                        .setStyle(TextInputStyle.Paragraph)
                        .setPlaceholder("You don't meet the required work quality.")
                        .setRequired(true)
                )
            );

        return interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === 'deny_modal') {
        const denyReason = interaction.fields.getTextInputValue('deny_reason');
        if (!member) return interaction.reply({ content: 'User not found.', ephemeral: true });

    function findButtonRows(node) {
        const results = [];

        if (node?.data?.type === 1 && Array.isArray(node.components)) {
            results.push(node);
        }

        if (Array.isArray(node?.components)) {
            for (const child of node.components) {
                results.push(...findButtonRows(child));
            }
        }

        return results;
    }

    const components = interaction.message.components;
    const buttonRows = components.flatMap(findButtonRows);

    if (!buttonRows.length) {
        console.warn('No button rows found in component tree');
        return;
    }

    const updatedComponents = components.map(root =>
        traverseAndReplace(root, node => {
            if (node?.data?.type === 1) {
                return new ActionRowBuilder().addComponents(
                    node.components.map(btn =>
                        ButtonBuilder.from(btn).setDisabled(true)
                    )
                );
            }
            return node;
        })
    );

    function traverseAndReplace(node, replacer) {
        const replaced = replacer(node);
        if (replaced !== node) return replaced;

        if (Array.isArray(node?.components)) {
            node.components = node.components.map(child =>
                traverseAndReplace(child, replacer)
            );
        }
        return node;
    }

    await interaction.update({ components: updatedComponents });

        await member.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(color)
                    .setTitle('Creative Team Application Denied')
                    .setDescription(
                        `Unfortunately, your application has been denied. \n\n**Reason:** \`\`\`txt\n${denyReason}\n\`\`\``
                    )
                    .setImage(footerImageUrl)
            ]
        }).catch(() => null);

        if (thread) {
            await thread.send(`**<@${member.id}>**'s application has been **denied** by **${staffMember.tag}** for the reason: *${denyReason}*`);
            await thread.setLocked(true, 'Application reviewed');
        }
    }
    });

    client.login(TOKEN);