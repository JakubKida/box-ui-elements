import * as React from 'react';
import { mount } from 'enzyme/build';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';

import { FEED_ITEM_TYPE_ANNOTATION, FEED_ITEM_TYPE_COMMENT, FEED_ITEM_TYPE_TASK } from '../../../constants';
import { SidebarPanelsComponent as SidebarPanels } from '../SidebarPanels';

// mock lazy imports
jest.mock('../SidebarUtils');

describe('elements/content-sidebar/SidebarPanels', () => {
    const getWrapper = ({ path = '/', ...rest } = {}) =>
        mount(
            <SidebarPanels
                file={{ id: '1234' }}
                hasBoxAI
                hasDocGen
                hasActivity
                hasDetails
                hasMetadata
                hasSkills
                hasVersions
                isOpen
                {...rest}
            />,
            {
                wrappingComponent: MemoryRouter,
                wrappingComponentProps: {
                    initialEntries: [path],
                    keyLength: 0,
                },
            },
        );

    const getSidebarPanels = ({ path = '/', ...props }) => (
        <MemoryRouter initialEntries={[path]}>
            <SidebarPanels
                file={{ id: '1234' }}
                hasBoxAI
                hasDocGen
                hasActivity
                hasDetails
                hasMetadata
                hasSkills
                hasVersions
                isOpen
                {...props}
            />
            ,
        </MemoryRouter>
    );

    describe('render', () => {
        test.each`
            path                                 | sidebar
            ${'/activity'}                       | ${'ActivitySidebar'}
            ${'/activity/comments'}              | ${'ActivitySidebar'}
            ${'/activity/comments/1234'}         | ${'ActivitySidebar'}
            ${'/activity/tasks'}                 | ${'ActivitySidebar'}
            ${'/activity/tasks/1234'}            | ${'ActivitySidebar'}
            ${'/activity/annotations/1234/5678'} | ${'ActivitySidebar'}
            ${'/activity/annotations/1234'}      | ${'ActivitySidebar'}
            ${'/activity/versions'}              | ${'VersionsSidebar'}
            ${'/activity/versions/1234'}         | ${'VersionsSidebar'}
            ${'/details'}                        | ${'DetailsSidebar'}
            ${'/details/versions'}               | ${'VersionsSidebar'}
            ${'/details/versions/1234'}          | ${'VersionsSidebar'}
            ${'/metadata'}                       | ${'MetadataSidebar'}
            ${'/skills'}                         | ${'SkillsSidebar'}
            ${'/boxai'}                          | ${'BoxAISidebar'}
            ${'/docgen'}                         | ${'DocGenSidebar'}
            ${'/nonsense'}                       | ${'BoxAISidebar'}
            ${'/'}                               | ${'BoxAISidebar'}
        `('should render $sidebar given the path $path', ({ path, sidebar }) => {
            const wrapper = getWrapper({ path });
            expect(wrapper.exists(sidebar)).toBe(true);
        });

        test.each`
            defaultPanel  | sidebar
            ${'activity'} | ${'activity-sidebar'}
            ${'docgen'}   | ${'docgen-sidebar'}
            ${'details'}  | ${'details-sidebar'}
            ${'metadata'} | ${'metadata-sidebar'}
            ${'skills'}   | ${'skills-sidebar'}
            ${'boxai'}    | ${'boxai-sidebar'}
            ${'nonsense'} | ${'boxai-sidebar'}
            ${undefined}  | ${'boxai-sidebar'}
        `(
            'should render $sidebar given the path = "/" and defaultPanel = $defaultPanel',
            ({ defaultPanel, sidebar }) => {
                render(
                    getSidebarPanels({
                        defaultPanel,
                    }),
                );
                expect(screen.getByTestId(sidebar)).toBeInTheDocument();
            },
        );

        test.each`
            defaultPanel  | expectedSidebar     | hasActivity | hasDetails | hasMetadata | hasSkills | hasDocGen | hasBoxAI
            ${'activity'} | ${'boxai-sidebar'}  | ${false}    | ${true}    | ${true}     | ${true}   | ${true}   | ${true}
            ${'details'}  | ${'boxai-sidebar'}  | ${true}     | ${false}   | ${true}     | ${true}   | ${true}   | ${true}
            ${'metadata'} | ${'boxai-sidebar'}  | ${true}     | ${true}    | ${false}    | ${true}   | ${true}   | ${true}
            ${'skills'}   | ${'boxai-sidebar'}  | ${true}     | ${true}    | ${true}     | ${false}  | ${true}   | ${true}
            ${'docgen'}   | ${'boxai-sidebar'}  | ${true}     | ${true}    | ${true}     | ${false}  | ${false}  | ${true}
            ${'boxai'}    | ${'docgen-sidebar'} | ${true}     | ${true}    | ${true}     | ${true}   | ${true}   | ${false}
        `(
            'should render first available panel for users without rights to render default panel, given the path = "/" and defaultPanel = $defaultPanel',
            ({
                defaultPanel,
                expectedSidebar,
                hasActivity,
                hasDetails,
                hasMetadata,
                hasSkills,
                hasDocGen,
                hasBoxAI,
            }) => {
                render(
                    getSidebarPanels({
                        defaultPanel,
                        hasActivity,
                        hasDetails,
                        hasMetadata,
                        hasSkills,
                        hasDocGen,
                        hasBoxAI,
                    }),
                );
                expect(screen.getByTestId(expectedSidebar)).toBeInTheDocument();
            },
        );

        describe('sidebar selected with path should take precedence over default panel', () => {
            test.each`
                path                                 | sidebar               | defaultPanel
                ${'/activity'}                       | ${'activity-sidebar'} | ${'details'}
                ${'/activity/comments'}              | ${'activity-sidebar'} | ${'details'}
                ${'/activity/comments/1234'}         | ${'activity-sidebar'} | ${'details'}
                ${'/activity/tasks'}                 | ${'activity-sidebar'} | ${'details'}
                ${'/activity/tasks/1234'}            | ${'activity-sidebar'} | ${'details'}
                ${'/activity/annotations/1234/5678'} | ${'activity-sidebar'} | ${'details'}
                ${'/activity/annotations/1234'}      | ${'activity-sidebar'} | ${'details'}
                ${'/activity/versions'}              | ${'versions-sidebar'} | ${'details'}
                ${'/activity/versions/1234'}         | ${'versions-sidebar'} | ${'details'}
                ${'/details'}                        | ${'details-sidebar'}  | ${'activity'}
                ${'/details/versions'}               | ${'versions-sidebar'} | ${'activity'}
                ${'/details/versions/1234'}          | ${'versions-sidebar'} | ${'activity'}
                ${'/metadata'}                       | ${'metadata-sidebar'} | ${'details'}
                ${'/skills'}                         | ${'skills-sidebar'}   | ${'details'}
                ${'/boxai'}                          | ${'boxai-sidebar'}    | ${'details'}
                ${'/docgen'}                         | ${'docgen-sidebar'}   | ${'details'}
            `(
                'should render $sidebar given the path = $path and defaultPanel = $defaultPanel',
                ({ path, sidebar, defaultPanel }) => {
                    render(
                        getSidebarPanels({
                            defaultPanel,
                            path,
                        }),
                    );
                    expect(screen.getByTestId(sidebar)).toBeInTheDocument();
                },
            );
        });

        test('should render redesigned metadata sidebar if it is enabled', () => {
            const wrapper = getWrapper({ path: '/metadata', features: { metadata: { redesign: { enabled: true } } } });
            expect(wrapper.exists('MetadataSidebarRedesigned')).toBe(true);
        });

        test('should render nothing if the sidebar is closed', () => {
            const wrapper = getWrapper({
                isOpen: false,
            });
            expect(wrapper.isEmptyRender()).toBe(true);
        });

        test('should render nothing if all sidebars are disabled', () => {
            const wrapper = getWrapper({
                hasBoxAI: false,
                hasActivity: false,
                hasDetails: false,
                hasMetadata: false,
                hasSkills: false,
                hasVersions: false,
            });
            expect(wrapper.isEmptyRender()).toBe(true);
        });

        describe('activity sidebar', () => {
            test('should render with tasks deeplink', () => {
                const wrapper = getWrapper({ path: '/activity/tasks/12345' });
                expect(wrapper.find('ActivitySidebar').props()).toMatchObject({
                    activeFeedEntryType: FEED_ITEM_TYPE_TASK,
                    activeFeedEntryId: '12345',
                });
            });

            test('should render with comments deeplink', () => {
                const wrapper = getWrapper({ path: '/activity/comments/12345' });
                expect(wrapper.find('ActivitySidebar').props()).toMatchObject({
                    activeFeedEntryType: FEED_ITEM_TYPE_COMMENT,
                    activeFeedEntryId: '12345',
                });
            });

            test('should render with versions deeplink', () => {
                const wrapper = getWrapper({ path: '/activity/versions/12345' });
                expect(wrapper.find('VersionsSidebar').props()).toMatchObject({
                    versionId: '12345',
                });
            });

            test('should render with annotations deeplink', () => {
                const wrapper = getWrapper({ path: '/activity/annotations/12345/67890' });
                expect(wrapper.find('ActivitySidebar').props()).toMatchObject({
                    activeFeedEntryType: FEED_ITEM_TYPE_ANNOTATION,
                    activeFeedEntryId: '67890',
                });
            });

            test('should not pass down activeFeedEntry props with partial annotations deeplink', () => {
                const wrapper = getWrapper({ path: '/activity/annotations/12345' });
                expect(wrapper.find('ActivitySidebar').props()).toMatchObject({
                    activeFeedEntryType: undefined,
                    activeFeedEntryId: undefined,
                });
            });
        });

        describe('details sidebar', () => {
            test('should render with versions deeplink', () => {
                const wrapper = getWrapper({ path: '/details/versions/12345' });
                expect(wrapper.find('VersionsSidebar').props()).toMatchObject({
                    versionId: '12345',
                });
            });
        });

        describe('first loaded behavior', () => {
            test('should update isInitialized state on mount', () => {
                const wrapper = getWrapper({ path: '/activity' });
                const sidebarPanels = wrapper.find(SidebarPanels);
                expect(sidebarPanels.state('isInitialized')).toBe(true);
            });
        });
    });

    describe('refresh()', () => {
        test.each([true, false])('should call the sidebars with the appropriate argument', shouldRefreshCache => {
            const instance = getWrapper().find(SidebarPanels).instance();

            ['boxAISidebar', 'activitySidebar', 'detailsSidebar', 'metadataSidebar', 'versionsSidebar'].forEach(
                sidebar => {
                    instance[sidebar] = { current: { refresh: jest.fn() } };
                },
            );

            instance.refresh(shouldRefreshCache);

            expect(instance.activitySidebar.current.refresh).toHaveBeenCalledWith(shouldRefreshCache);
            expect(instance.boxAISidebar.current.refresh).toHaveBeenCalledWith();
            expect(instance.detailsSidebar.current.refresh).toHaveBeenCalledWith();
            expect(instance.metadataSidebar.current.refresh).toHaveBeenCalledWith();
            expect(instance.versionsSidebar.current.refresh).toHaveBeenCalledWith();
        });
    });

    describe('componentDidUpdate', () => {
        const onVersionChange = jest.fn();

        test.each([
            ['/activity/versions/123', '/activity/versions/456'],
            ['/activity/versions/123', '/details/versions/456'],
            ['/activity/versions', '/activity/versions/123'],
            ['/activity/versions', '/details/versions'],
        ])('should not reset the current version if the versions route is still active', (prevPathname, pathname) => {
            const wrapper = getWrapper({ location: { pathname: prevPathname }, onVersionChange });
            wrapper.setProps({ location: { pathname } });
            expect(onVersionChange).not.toBeCalled();
        });

        test.each([true, false])('should not reset the current version if the sidebar is toggled', isOpen => {
            const wrapper = getWrapper({ isOpen, location: { pathname: '/details/versions/123' }, onVersionChange });
            wrapper.setProps({ isOpen: !isOpen });
            expect(onVersionChange).not.toBeCalled();
        });

        test.each([
            ['/activity/versions/123', '/metadata'],
            ['/activity/versions/123', '/activity'],
            ['/activity/versions', '/metadata'],
            ['/details/versions/123', '/metadata'],
            ['/details/versions/123', '/details'],
            ['/details/versions', '/metadata'],
        ])('should reset the current version if the versions route is no longer active', (prevPathname, pathname) => {
            const wrapper = getWrapper({ location: { pathname: prevPathname }, onVersionChange });
            wrapper.setProps({ location: { pathname } });
            expect(onVersionChange).toBeCalledWith(null);
        });
    });
});
